export type WorksheetStatusSlug =
    | 'pending-edit'
    | 'pending-review'
    | 'validated'
    | 'rejected';

const BACKEND_STATUS_BY_SLUG: Record<WorksheetStatusSlug, string> = {
    'pending-edit': 'Pending Edit',
    'pending-review': 'Pending Review',
    validated: 'Validated',
    rejected: 'Rejected',
};

const SLUG_BY_BACKEND_STATUS = Object.entries(BACKEND_STATUS_BY_SLUG).reduce(
    (acc, [slug, backend]) => {
        acc[backend] = slug as WorksheetStatusSlug;
        return acc;
    },
    {} as Record<string, WorksheetStatusSlug>
);

export const toBackendWorksheetStatus = (status: string) =>
    BACKEND_STATUS_BY_SLUG[status as WorksheetStatusSlug] ?? status;

export const toWorksheetStatusSlug = (status: string) =>
    SLUG_BY_BACKEND_STATUS[status] ?? status;

export const normalizeWorksheetStatus = <T extends { status?: string }>(
    data: T[] | T
) => {
    if (Array.isArray(data)) {
        return data.map((item) => ({
            ...item,
            status: item.status ? toWorksheetStatusSlug(item.status) : item.status,
        }));
    }

    return {
        ...data,
        status: data.status ? toWorksheetStatusSlug(data.status) : data.status,
    };
};
