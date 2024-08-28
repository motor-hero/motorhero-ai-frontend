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

    const handleViewDetails = () => {
        setDetailModalOpen(true);
    };

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
                    {value.status === 'pending' && value.type === 'scraping' && (
                        <MenuItem onClick={runJobModal.onOpen} icon={<FiPlay fontSize="16px" />}>
                            Executar {type}
                        </MenuItem>
                    )}
                    {!enrichmentJob && (
                        <MenuItem onClick={enrichJobModal.onOpen} icon={<FiPlusCircle fontSize="16px" />}>
                            Criar Enriquecimento {type}
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleViewDetails} icon={<FiEye fontSize="16px" />}>
                        Ver Detalhes
                    </MenuItem>
                    <MenuItem onClick={deleteModal.onOpen} icon={<FiTrash fontSize="16px" />} color="ui.danger">
                        Deletar {type}
                    </MenuItem>
                </MenuList>
            </Menu>

            <RunJobModal job={enrichmentJob || value} isOpen={runJobModal.isOpen} onClose={runJobModal.onClose} />

            {value && value.id && (
                <EnrichJobModal job={value} isOpen={enrichJobModal.isOpen} onClose={enrichJobModal.onClose} />
            )}

            <Delete type={type} id={value.id} isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} />

            {value && (
                <JobDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    jobId={value.id}
                />
            )}
        </>
    );
};

export default ActionsMenuJob;
