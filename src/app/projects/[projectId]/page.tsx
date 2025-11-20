type Props = {
    params: Promise<{
        projectId: string 
    }>
}

export const page = async ({ params } : Props) => {
    const { projectId } = await params;

    return (
        <div>
            <h1>Project ID: {projectId}</h1>
        </div>
    )
}