'use client'

import {
    useEffect,
    useRef,
    useState
} from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

import {
    FileText,
    Upload,
    MoreVertical,
    Trash2,
    Download,
    MessageSquare,
    Clock,
    File,
    Loader2
} from 'lucide-react'

import {
    getDocuments,
    getToken,
    uploadDocument,
    deleteDocument,
    removeToken,
    ApiError,
    type DocumentItem
} from '@/lib/api'


export default function DashboardPage() {

    const router =
        useRouter()

    const fileInputRef =
        useRef<HTMLInputElement>(null)


    // =====================================================
    // STATE
    // =====================================================

    const [documents, setDocuments] =
        useState<DocumentItem[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    const [openMenu, setOpenMenu] =
        useState<number | null>(null)

    const [uploading, setUploading] =
        useState(false)

    const [deletingId, setDeletingId] =
        useState<number | null>(null)


    // =====================================================
    // LOAD DOCUMENTS
    // =====================================================

    async function loadDocuments() {

        try {

            setLoading(true)

            setError(null)


            // -------------------------------------------------
            // Check JWT
            // -------------------------------------------------

            const token =
                getToken()

            console.log(
                '[Dashboard] Token exists:',
                !!token
            )


            if (!token) {

                console.warn(
                    '[Dashboard] No JWT token found.'
                )

                router.replace('/login')

                return
            }


            // -------------------------------------------------
            // Get documents
            // -------------------------------------------------

            const data =
                await getDocuments()


            console.log(
                '[Dashboard] Documents:',
                data
            )


            setDocuments(data)

        }

        catch (error) {

            console.error(
                '[Dashboard] Failed to load documents:',
                error
            )


            // -------------------------------------------------
            // Handle 401
            // -------------------------------------------------

            if (
                error instanceof ApiError &&
                error.status === 401
            ) {

                removeToken()

                router.replace('/login')

                return
            }


            // -------------------------------------------------
            // Normal error
            // -------------------------------------------------

            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load documents.'
            )

        }

        finally {

            setLoading(false)

        }
    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadDocuments()

    }, [])


    // =====================================================
    // SELECT FILE
    // =====================================================

    function handleBrowseFiles() {

        fileInputRef.current?.click()

    }


    // =====================================================
    // FILE SELECTED
    // =====================================================

    async function handleFileSelected(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const file =
            event.target.files?.[0]


        if (!file) {
            return
        }


        // -------------------------------------------------
        // PDF validation
        // -------------------------------------------------

        if (
            file.type !==
            'application/pdf'
        ) {

            setError(
                'Only PDF files are supported right now.'
            )

            event.target.value = ''

            return
        }


        // -------------------------------------------------
        // 10 MB validation
        // -------------------------------------------------

        const maxSize =
            10 * 1024 * 1024


        if (
            file.size > maxSize
        ) {

            setError(
                'File size cannot exceed 10 MB.'
            )

            event.target.value = ''

            return
        }


        try {

            setUploading(true)

            setError(null)


            // -------------------------------------------------
            // Upload
            // -------------------------------------------------

            await uploadDocument(
                file
            )


            // -------------------------------------------------
            // Reload documents
            // -------------------------------------------------

            await loadDocuments()

        }

        catch (error) {

            console.error(
                '[Dashboard] Upload failed:',
                error
            )


            if (
                error instanceof ApiError &&
                error.status === 401
            ) {

                removeToken()

                router.replace('/login')

                return
            }


            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload document.'
            )

        }

        finally {

            setUploading(false)

            // Reset input so same file can be selected again
            event.target.value = ''

        }
    }


    // =====================================================
    // DELETE DOCUMENT
    // =====================================================

    async function handleDeleteDocument(
        documentId: number
    ) {

        const confirmed =
            window.confirm(
                'Are you sure you want to delete this document?'
            )


        if (!confirmed) {
            return
        }


        try {

            setDeletingId(
                documentId
            )

            setError(null)

            setOpenMenu(null)


            // -------------------------------------------------
            // Delete
            // -------------------------------------------------

            await deleteDocument(
                documentId
            )


            // -------------------------------------------------
            // Remove from UI
            // -------------------------------------------------

            setDocuments(
                current =>
                    current.filter(
                        document =>
                            document.id !==
                            documentId
                    )
            )

        }

        catch (error) {

            console.error(
                '[Dashboard] Delete failed:',
                error
            )


            if (
                error instanceof ApiError &&
                error.status === 401
            ) {

                removeToken()

                router.replace('/login')

                return
            }


            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete document.'
            )

        }

        finally {

            setDeletingId(null)

        }
    }


    // =====================================================
    // DOWNLOAD DOCUMENT
    // =====================================================

    function handleDownload(
        document: DocumentItem
    ) {

        if (!document.fileUrl) {

            setError(
                'Document file URL is not available.'
            )

            return
        }


        // -------------------------------------------------
        // NOTE:
        // FileUrl currently contains the Supabase storage
        // path, not necessarily a public URL.
        //
        // This button will therefore only work directly
        // if FileUrl is a downloadable URL.
        // -------------------------------------------------

        window.open(
            document.fileUrl,
            '_blank'
        )

        setOpenMenu(null)
    }


    // =====================================================
    // FORMAT FILE SIZE
    // =====================================================

    function formatFileSize(
        bytes: number
    ): string {

        if (bytes === 0) {
            return '0 Bytes'
        }


        const units = [
            'Bytes',
            'KB',
            'MB',
            'GB'
        ]


        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            )


        return `${(
            bytes /
            Math.pow(
                1024,
                index
            )
        ).toFixed(1)} ${units[index]}`
    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(
        date: string
    ): string {

        return new Date(
            date
        ).toLocaleDateString(
            'en-IN',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }
        )
    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="p-6">


            {/* =================================================
          HEADER
      ================================================= */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold mb-2">
                    My Documents
                </h1>

                <p className="text-foreground/60">
                    Upload and manage your documents for AI analysis
                </p>

            </div>


            {/* =================================================
          HIDDEN FILE INPUT
      ================================================= */}

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelected}
            />


            {/* =================================================
          UPLOAD SECTION
      ================================================= */}

            <div
                onClick={() =>
                    !uploading &&
                    handleBrowseFiles()
                }
                className="mb-8 border-2 border-dashed border-accent/30 rounded-lg p-8 text-center hover:border-accent/50 transition cursor-pointer bg-accent/5"
            >

                {uploading ? (

                    <Loader2
                        className="w-12 h-12 text-accent mx-auto mb-4 animate-spin"
                    />

                ) : (

                    <Upload
                        className="w-12 h-12 text-accent mx-auto mb-4"
                    />

                )}


                <h3 className="text-lg font-semibold mb-2">

                    {uploading
                        ? 'Uploading document...'
                        : 'Drag and drop your documents here'}

                </h3>


                {!uploading && (

                    <>
                        <p className="text-foreground/60 mb-4">
                            or
                        </p>


                        <Button
                            type="button"
                            className="gap-2"
                            onClick={(event) => {

                                event.stopPropagation()

                                handleBrowseFiles()

                            }}
                        >

                            <FileText
                                className="w-4 h-4"
                            />

                            Browse Files

                        </Button>


                        <p className="text-xs text-foreground/50 mt-4">
                            Supports PDF. Max 10MB per file.
                        </p>
                    </>

                )}

            </div>


            {/* =================================================
          DOCUMENTS
      ================================================= */}

            <div>


                <h2 className="text-lg font-semibold mb-4">

                    Recent Documents ({
                        documents.length
                    })

                </h2>


                {/* =================================================
            LOADING
        ================================================= */}

                {loading && (

                    <div className="py-8 text-center text-foreground/60">

                        <Loader2
                            className="w-6 h-6 animate-spin mx-auto mb-2"
                        />

                        Loading documents...

                    </div>

                )}


                {/* =================================================
            ERROR
        ================================================= */}

                {!loading && error && (

                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                        {error}

                    </div>

                )}


                {/* =================================================
            EMPTY
        ================================================= */}

                {!loading &&
                    !error &&
                    documents.length === 0 && (

                        <div className="py-12 text-center">

                            <File
                                className="w-10 h-10 mx-auto mb-3 text-foreground/40"
                            />

                            <h3 className="text-lg font-semibold">
                                No documents yet
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Upload your first document to get started.
                            </p>

                        </div>

                    )}


                {/* =================================================
            DOCUMENT LIST
        ================================================= */}

                {!loading &&
                    !error &&
                    documents.length > 0 && (

                        <div className="grid gap-4">

                            {documents.map(
                                (doc) => {

                                    const IconComponent =
                                        File

                                    const isDeleting =
                                        deletingId === doc.id


                                    return (

                                        <div
                                            key={doc.id}
                                            className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition group"
                                        >

                                            <div className="flex items-center justify-between">


                                                {/* =================================
                            DOCUMENT INFORMATION
                        ================================= */}

                                                <div className="flex items-center gap-4 flex-1 min-w-0">


                                                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">

                                                        <IconComponent
                                                            className="w-6 h-6 text-accent"
                                                        />

                                                    </div>


                                                    <div className="flex-1 min-w-0">

                                                        <h3 className="font-medium truncate">
                                                            {doc.fileName}
                                                        </h3>


                                                        <div className="flex items-center gap-4 text-sm text-foreground/60 mt-1">


                                                            <span>
                                                                {formatFileSize(
                                                                    doc.fileSize
                                                                )}
                                                            </span>


                                                            <div className="flex items-center gap-1">

                                                                <Clock
                                                                    className="w-4 h-4"
                                                                />

                                                                {formatDate(
                                                                    doc.uploadedAt
                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>


                                                {/* =================================
                            ACTIONS
                        ================================= */}

                                                <div className="flex items-center gap-2 ml-4">


                                                    {/* Chat */}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-2 opacity-0 group-hover:opacity-100 transition"
                                                        onClick={() => { }}
                                                    >

                                                        <MessageSquare
                                                            className="w-4 h-4"
                                                        />

                                                        Chat

                                                    </Button>


                                                    {/* =================================
                              MORE MENU
                          ================================= */}

                                                    <div className="relative">

                                                        <button
                                                            type="button"
                                                            disabled={isDeleting}
                                                            onClick={() =>
                                                                setOpenMenu(
                                                                    openMenu === doc.id
                                                                        ? null
                                                                        : doc.id
                                                                )
                                                            }
                                                            className="p-2 hover:bg-secondary rounded-lg transition disabled:opacity-50"
                                                        >

                                                            {isDeleting ? (

                                                                <Loader2
                                                                    className="w-5 h-5 animate-spin"
                                                                />

                                                            ) : (

                                                                <MoreVertical
                                                                    className="w-5 h-5"
                                                                />

                                                            )}

                                                        </button>


                                                        {/* =================================
                                DROPDOWN
                            ================================= */}

                                                        {openMenu === doc.id && (

                                                            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">


                                                                {/* Download */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDownload(
                                                                            doc
                                                                        )
                                                                    }
                                                                    className="w-full text-left px-4 py-2 hover:bg-secondary flex items-center gap-2 text-sm"
                                                                >

                                                                    <Download
                                                                        className="w-4 h-4"
                                                                    />

                                                                    Download

                                                                </button>


                                                                {/* Delete */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteDocument(
                                                                            doc.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isDeleting
                                                                    }
                                                                    className="w-full text-left px-4 py-2 hover:bg-secondary flex items-center gap-2 text-sm border-t border-border text-destructive disabled:opacity-50"
                                                                >

                                                                    <Trash2
                                                                        className="w-4 h-4"
                                                                    />

                                                                    Delete

                                                                </button>

                                                            </div>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                }
                            )}

                        </div>

                    )}

            </div>

        </div>
    )
}