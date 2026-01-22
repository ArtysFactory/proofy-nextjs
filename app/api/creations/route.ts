import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';
import { anchorToBlockchain, simulateAnchor, PROOFY_REGISTRY_ADDRESS } from '@/lib/blockchain';

async function verifyToken(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const jwtSecret = process.env.JWT_SECRET || 'proofy-prod-secret-artys-2024';
        const secretKey = new TextEncoder().encode(jwtSecret);

        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        return null;
    }
}

// GET /api/creations - List user creations
export async function GET(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        const creations = await sql`
            SELECT 
                id, 
                public_id as "publicId", 
                title, 
                short_description as "shortDescription",
                file_hash as "fileHash", 
                file_name as "fileName",
                file_size as "fileSize",
                file_type as "fileType",
                project_type as "projectType", 
                made_by as "madeBy",
                status, 
                created_at as "createdAt", 
                tx_hash as "txHash", 
                block_number as "blockNumber",
                chain,
                contract_address as "contractAddress",
                cosignature_required as "cosignatureRequired",
                cosignature_count as "cosignatureCount",
                cosignature_signed_count as "cosignatureSignedCount",
                cosignature_expires_at as "cosignatureExpiresAt"
            FROM creations
            WHERE user_id = ${payload.userId}
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ creations: creations || [] });
    } catch (error: any) {
        console.error('Get creations error:', error);
        return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
    }
}

// POST /api/creations - Create new proof with blockchain anchoring
export async function POST(request: NextRequest) {
    try {
        const payload = await verifyToken(request);
        if (!payload) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        
        // Extract all fields from request
        const {
            title,
            shortDescription,
            fileHash,
            fileName,
            fileSize,
            fileType,
            projectType,
            madeBy,
            aiHumanRatio,
            aiTools,
            humanContribution,
            mainPrompt,
            mainPromptPrivate,
            depositorType,
            companyInfo,
            publicPseudo,
            coAuthors,
            musicProducers,
            musicLabels,
            musicOthers,
            declaredOwnership,
            acceptedAITerms,
            // V3 Rights fields
            copyrightRights,
            neighboringRights,
            musicWork,
            musicParties,
            musicMasters,
            musicReleases,
            // Co-signature flag
            requiresCosignature,
            cosignatoryEmails,
        } = body;

        // Validation
        if (!title || !fileHash || !projectType) {
            return NextResponse.json(
                { error: 'Titre, hash du fichier et type de projet requis' },
                { status: 400 }
            );
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(databaseUrl);

        // Generate unique public ID
        const publicId = generatePublicId();

        let blockchainResult;
        let status: string;
        let chain: string;

        // Debug log
        console.log(`[Creation] requiresCosignature: ${requiresCosignature}, cosignatoryEmails: ${JSON.stringify(cosignatoryEmails)}, count: ${cosignatoryEmails?.length || 0}`);

        // If co-signature required, don't anchor yet - wait for all signatures
        // Note: > 1 because we need at least 2 different people for co-signature
        if (requiresCosignature && cosignatoryEmails && cosignatoryEmails.length > 1) {
            console.log(`[Creation] Co-signature required for ${cosignatoryEmails.length} people - deferring blockchain anchoring`);
            blockchainResult = {
                success: false,
                simulated: true,
                txHash: null,
                blockNumber: null,
            };
            status = 'pending_signatures';
            chain = 'polygon_mainnet'; // Will be anchored later
        } else {
            // Perform blockchain anchoring immediately
            const privateKey = process.env.POLYGON_PRIVATE_KEY;
            const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

            if (privateKey && privateKey.length > 0) {
                // Real blockchain anchoring
                console.log(`[Creation] Anchoring to Polygon Mainnet...`);
                blockchainResult = await anchorToBlockchain(
                    fileHash,
                    publicId,
                    projectType,
                    privateKey,
                    rpcUrl
                );
            } else {
                // Simulation mode
                console.log(`[Creation] No POLYGON_PRIVATE_KEY - using simulation mode`);
                blockchainResult = await simulateAnchor(fileHash, publicId, projectType);
            }

            // Determine status and chain info
            status = blockchainResult.success ? 'confirmed' : 'pending';
            chain = blockchainResult.simulated ? 'polygon_mainnet_simulated' : 'polygon_mainnet';
        }

        // Insert creation with all fields
        const result = await sql`
            INSERT INTO creations (
                user_id, 
                public_id, 
                title, 
                short_description,
                description,
                file_hash, 
                file_name,
                file_size,
                file_type,
                project_type, 
                made_by,
                ai_human_ratio,
                ai_tools,
                human_contribution,
                main_prompt,
                main_prompt_private,
                depositor_type,
                company_info,
                public_pseudo,
                co_authors,
                music_producers,
                music_labels,
                music_others,
                declared_ownership,
                accepted_ai_terms,
                copyright_rights,
                neighboring_rights,
                music_work,
                music_parties,
                music_masters,
                music_releases,
                status,
                chain,
                tx_hash,
                block_number,
                contract_address,
                on_chain_timestamp,
                created_at, 
                updated_at
            )
            VALUES (
                ${payload.userId}, 
                ${publicId}, 
                ${title.trim()}, 
                ${shortDescription?.trim() || null},
                ${shortDescription?.trim() || null},
                ${fileHash}, 
                ${fileName || null},
                ${fileSize || null},
                ${fileType || null},
                ${projectType}, 
                ${madeBy || 'human'},
                ${aiHumanRatio || 0},
                ${aiTools || null},
                ${humanContribution || null},
                ${mainPrompt || null},
                ${mainPromptPrivate || false},
                ${depositorType || 'individual'},
                ${companyInfo ? JSON.stringify(companyInfo) : null},
                ${publicPseudo || null},
                ${coAuthors ? JSON.stringify(coAuthors) : null},
                ${musicProducers ? JSON.stringify(musicProducers) : null},
                ${musicLabels ? JSON.stringify(musicLabels) : null},
                ${musicOthers ? JSON.stringify(musicOthers) : null},
                ${declaredOwnership || false},
                ${acceptedAITerms || false},
                ${copyrightRights ? JSON.stringify(copyrightRights) : null},
                ${neighboringRights ? JSON.stringify(neighboringRights) : null},
                ${musicWork ? JSON.stringify(musicWork) : null},
                ${musicParties ? JSON.stringify(musicParties) : null},
                ${musicMasters ? JSON.stringify(musicMasters) : null},
                ${musicReleases ? JSON.stringify(musicReleases) : null},
                ${status},
                ${chain},
                ${blockchainResult.txHash || null},
                ${blockchainResult.blockNumber || null},
                ${blockchainResult.success ? PROOFY_REGISTRY_ADDRESS : null},
                ${blockchainResult.timestamp ? new Date(blockchainResult.timestamp).toISOString() : null},
                NOW(), 
                NOW()
            )
            RETURNING id, public_id as "publicId"
        `;

        // If blockchain was successful, also create transaction record
        if (blockchainResult.success && blockchainResult.txHash) {
            const creationId = result[0]?.id;
            if (creationId) {
                await sql`
                    INSERT INTO transactions (
                        creation_id,
                        tx_hash,
                        chain,
                        block_number,
                        status,
                        on_chain_timestamp,
                        created_at
                    )
                    VALUES (
                        ${creationId},
                        ${blockchainResult.txHash},
                        ${chain},
                        ${blockchainResult.blockNumber || null},
                        'confirmed',
                        ${blockchainResult.timestamp ? new Date(blockchainResult.timestamp).toISOString() : null},
                        NOW()
                    )
                `;
            }
        }

        // Get the creation ID from the insert result
        const creationIdFromInsert = result[0]?.id;
        
        return NextResponse.json(
            {
                success: true,
                id: creationIdFromInsert,  // Add numeric ID for send-invitations API
                publicId,
                txHash: blockchainResult.txHash,
                blockNumber: blockchainResult.blockNumber,
                explorerUrl: blockchainResult.explorerUrl,
                simulated: blockchainResult.simulated,
                message: blockchainResult.success 
                    ? 'Création ancrée sur la blockchain avec succès'
                    : 'Création enregistrée (ancrage blockchain en attente)',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create proof error:', error);
        return NextResponse.json({ error: 'Erreur lors de la création', details: error.message }, { status: 500 });
    }
}

function generatePublicId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const runtime = 'edge';
