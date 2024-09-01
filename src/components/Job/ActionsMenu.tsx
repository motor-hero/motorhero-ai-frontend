import React, { useState } from 'react';
import { Button, Menu, MenuButton, MenuItem, MenuList, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text, Box } from '@chakra-ui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiPlay, FiTrash, FiPlusCircle, FiEye, FiAlertCircle } from 'react-icons/fi';
import RunJobModal from './RunJob';
import Delete from '../Common/DeleteAlert';
import EnrichJobModal from './EnrichmentJob';
import JobDetailModal from "./JobDetail.tsx";

interface ActionsMenuProps {
    type: string;
    value: any;
    disabled?: boolean;
}

const ErrorDetailModal = ({ isOpen, onClose, errorMessage }) => (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Detalhes do Erro</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Box overflowX="auto">
                    <Text whiteSpace="pre-wrap" fontFamily="monospace">
                        {errorMessage}
                    </Text>
                </Box>
            </ModalBody>
            <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                    Fechar
                </Button>
                <Button colorScheme="blue" mr={3} onClick={() => navigator.clipboard.writeText(errorMessage)}>
                    Copiar
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);

const ActionsMenuJob = ({ type, value, disabled }: ActionsMenuProps) => {
    const runJobModal = useDisclosure();
    const deleteModal = useDisclosure();
    const enrichJobModal = useDisclosure();
    const errorDetailModal = useDisclosure();
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    const enrichmentJob = value.parent_job;
    const scrapingJob = value;

    const handleViewDetails = () => {
        setDetailModalOpen(true);
    };

    const canExecuteScraping = scrapingJob.status === 'pending';
    const canCreateEnrichment = scrapingJob.status === 'completed' && !enrichmentJob;
    const canExecuteEnrichment = enrichmentJob && enrichmentJob.status === 'pending';
    const canViewDetails = scrapingJob.status === 'completed' && enrichmentJob && enrichmentJob.status === 'completed';
    const canViewError = scrapingJob.status === 'failed' || (enrichmentJob && enrichmentJob.status === 'failed');

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
                    {canViewError && (
                        <MenuItem onClick={errorDetailModal.onOpen} icon={<FiAlertCircle fontSize="16px" />} color="red.500">
                            Ver Erro
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

            {canViewError && (
                <ErrorDetailModal
                    isOpen={errorDetailModal.isOpen}
                    onClose={errorDetailModal.onClose}
                    errorMessage={enrichmentJob?.error_message || scrapingJob.error_message}
                />
            )}
        </>
    );
};

export default ActionsMenuJob;