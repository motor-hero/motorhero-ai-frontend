import React, { useState } from 'react';
import { Button, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from '@chakra-ui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiPlay, FiTrash, FiPlusCircle, FiEye } from 'react-icons/fi';
import RunJobModal from './RunJob';
import Delete from '../Common/DeleteAlert';
import EnrichJobModal from './EnrichmentJob';
import JobDetailModal from "./JobDetail.tsx";

interface ActionsMenuProps {
    type: string;
    value: any;
    disabled?: boolean;
}

const ActionsMenuJob = ({ type, value, disabled }: ActionsMenuProps) => {
    const runJobModal = useDisclosure();
    const deleteModal = useDisclosure();
    const enrichJobModal = useDisclosure();
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    const enrichmentJob = value.parent_job;
    const scrapingJob = value;

    const handleViewDetails = () => {
        setDetailModalOpen(true);
    };

    const canExecuteScraping = scrapingJob.status === 'pending';
    const canCreateEnrichment = scrapingJob.status === 'completed' && !enrichmentJob;
    const canExecuteEnrichment = enrichmentJob && enrichmentJob.status === 'pending';
    const canViewDetails = scrapingJob.status === 'completed';

    return (
        <>
            <Menu>
                <MenuButton
                    isDisabled={disabled}
                    as={Button}
                    rightIcon={<BsThreeDotsVertical />}
                    variant="unstyled"
                />
                <MenuList>
                    {canExecuteScraping && (
                        <MenuItem onClick={runJobModal.onOpen} icon={<FiPlay fontSize="16px" />}>
                            Executar Scraping
                        </MenuItem>
                    )}
                    {canCreateEnrichment && (
                        <MenuItem onClick={enrichJobModal.onOpen} icon={<FiPlusCircle fontSize="16px" />}>
                            Criar Enriquecimento
                        </MenuItem>
                    )}
                    {canExecuteEnrichment && (
                        <MenuItem onClick={runJobModal.onOpen} icon={<FiPlay fontSize="16px" />}>
                            Executar Enriquecimento
                        </MenuItem>
                    )}
                    {canViewDetails && (
                        <MenuItem onClick={handleViewDetails} icon={<FiEye fontSize="16px" />}>
                            Ver Detalhes
                        </MenuItem>
                    )}
                    <MenuItem onClick={deleteModal.onOpen} icon={<FiTrash fontSize="16px" />} color="ui.danger">
                        Deletar {type}
                    </MenuItem>
                </MenuList>
            </Menu>

            <RunJobModal
                job={canExecuteEnrichment ? enrichmentJob : scrapingJob}
                isOpen={runJobModal.isOpen}
                onClose={runJobModal.onClose}
            />

            {canCreateEnrichment && (
                <EnrichJobModal job={scrapingJob} isOpen={enrichJobModal.isOpen} onClose={enrichJobModal.onClose} />
            )}

            <Delete type={type} id={scrapingJob.id} isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} />

            {canViewDetails && (
                <JobDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    jobId={scrapingJob.id}
                />
            )}
        </>
    );
};

export default ActionsMenuJob;