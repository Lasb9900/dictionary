"use client"
import { useEffect, useState } from "react";
import { WorkSheetFile } from "@/src/worksheets/componentes/WorkSheetFile/WorkSheetFile";
import { useWorksheetsContext } from "@/src/worksheets/context/WorkSheetsContext";
import Pagination from "@/src/users/components/Pagination/Pagination";
import AiProviderToggle from "@/src/components/AiProviderToggle";

const greenVariant = {
    buttonBackground: 'bg-d-green-light-button',
    buttonPointStyle: 'bg-d-green',
    buttonTextColor: 'text-d-green',
    buttonTitle: 'Validada',
}

const yellowVariant = {
    buttonBackground: 'bg-d-yellow-light-button',
    buttonPointStyle: 'bg-d-yellow',
    buttonTextColor: 'text-d-yellow',
    buttonTitle: 'Por Revisar',
}

const blueVariant = {
    buttonBackground: 'bg-d-blue-light-button',
    buttonPointStyle: 'bg-d-blue',
    buttonTextColor: 'text-d-blue',
    buttonTitle: 'Por Completar',
}

const redVariant = {
    buttonBackground: 'bg-d-red-light-button',
    buttonPointStyle: 'bg-d-red',
    buttonTextColor: 'text-d-red',
    buttonTitle: 'Rechazada',
}

const statusVariants: { [key: string]: typeof greenVariant } = {
    'Validated': greenVariant,
    'Pending Review': yellowVariant,
    'Pending Edit': blueVariant,
    'Rejected': redVariant,
};

export default function FilteredWorksheets({ data }: { data: any }) {
    const { searchTerm, filterType } = useWorksheetsContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        setCurrentPage(1);
    }
        , [searchTerm, filterType]);

    const filteredItems = data.filter((item: any) => {
        const matchesSearchTerm = searchTerm
            ? item.title.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        const matchesFilterType = filterType === "Todos"
            ? true
            : filterType === "Autores"
                ? item.type === "AuthorCard"
                : item.type !== "AuthorCard";

        return matchesSearchTerm && matchesFilterType;
    });

    const Items = filteredItems.map((item: any) => {
        const variant = statusVariants[item.status] || {};
        return {
            workSheetObservation: item.observation,
            workSheetStatus: item.status,
            workSheetId: item._id,
            workSheetDate: new Date(item.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }),
            workSheetName: item.title,
            workSheetType: item.type,
            editors: item.assignedEditors,
            reviewers: item.assignedReviewers,
            ...variant,
        };
    });

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentWorksheets = Items.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col sm:gap-4 xl:gap-0  mb-20">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <AiProviderToggle />
            </div>
            {
                currentWorksheets.map((item: any) => (
                    <WorkSheetFile key={item.workSheetName} {...item} />
                ))
            }
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(Items.length / itemsPerPage)}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
