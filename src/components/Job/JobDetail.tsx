import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobsService } from '../../client';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Button, Box, Heading, Text, Table, Tbody, Tr, Td, TableContainer, Thead, Th,
    Flex, Spacer, IconButton, Badge, Tabs, TabList, Tab, TabPanels, TabPanel,
    useColorModeValue, Tooltip, useDisclosure
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from '@chakra-ui/icons';

const JobDetailModal = ({ isOpen, onClose, jobId }) => {
    const { data: job, isLoading } = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => JobsService.getJob(jobId),
        enabled: isOpen,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');

    const { isOpen: isJsonModalOpen, onOpen: onJsonModalOpen, onClose: onJsonModalClose } = useDisclosure();
    const [selectedJson, setSelectedJson] = useState(null);

    const statusColor = useCallback((status) => {
        switch (status.toLowerCase()) {
            case 'concluído': return 'green';
            case 'em andamento': return 'blue';
            case 'falhou': return 'red';
            default: return 'yellow';
        }
    }, []);

    const openJsonModal = useCallback((data) => {
        setSelectedJson(data);
        onJsonModalOpen();
    }, [onJsonModalOpen]);

    const formatJson = useCallback((json) => {
        if (typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch (e) {
                return json;
            }
        }
        return JSON.stringify(json, null, 2);
    }, []);

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={bgColor}>
                    <ModalBody>
                        <Flex justify="center" align="center" height="200px">
                            <Text color={textColor}>Carregando...</Text>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    if (!job) {
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={bgColor}>
                    <ModalBody>
                        <Text color={textColor}>Trabalho não encontrado</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const selectedParts = job.parts.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(job.parts.length / itemsPerPage);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay />
                <ModalContent bg={bgColor}>
                    <ModalHeader color={textColor}>
                        Detalhes do Trabalho
                        <Badge ml={2} colorScheme={statusColor(job.status)}>{job.status}</Badge>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs isFitted variant="enclosed">
                            <TabList mb="1em">
                                <Tab>Visão Geral</Tab>
                                <Tab>Peças</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <Box mb={4}>
                                        <Heading size="md" mb={2} color={textColor}>Informações do Trabalho</Heading>
                                        <Table variant="simple" size="sm">
                                            <Tbody>
                                                <Tr>
                                                    <Td fontWeight="bold">ID:</Td>
                                                    <Td>{job.id}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Nome:</Td>
                                                    <Td>{job.name}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Status:</Td>
                                                    <Td>
                                                        <Badge colorScheme={statusColor(job.status)}>{job.status}</Badge>
                                                    </Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Tipo de Scraping:</Td>
                                                    <Td>{job.service_type}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Tipo de Enriquecimento:</Td>
                                                    <Td>{job.parent_job ? job.parent_job.service_type : 'N/A'}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Custo Estimado do Enriquecimento:</Td>
                                                    <Td>R$ {job.parent_job?.estimated_cost?.toFixed(2) || 'N/A'}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Total de Peças:</Td>
                                                    <Td>{job.total_parts}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Peças Processadas:</Td>
                                                    <Td>{job.processed_parts_count}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Criado em:</Td>
                                                    <Td>{new Date(job.created_at).toLocaleString('pt-BR')}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Atualizado em:</Td>
                                                    <Td>{new Date(job.updated_at).toLocaleString('pt-BR')}</Td>
                                                </Tr>
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </TabPanel>
                                <TabPanel>
                                    <Box>
                                        <Heading size="md" mb={2} color={textColor}>Peças</Heading>
                                        {job.parts.length > 0 ? (
                                            <>
                                                <TableContainer>
                                                    <Table variant="simple" size="sm">
                                                        <Thead>
                                                            <Tr>
                                                                <Th>Código</Th>
                                                                <Th>Status</Th>
                                                                <Th>Dados Scraping</Th>
                                                                <Th>Dados Enriquecidos</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {selectedParts.map((part) => (
                                                                <Tr key={part.id}>
                                                                    <Td>{part.code}</Td>
                                                                    <Td>
                                                                        <Badge colorScheme={statusColor(part.status)}>{part.status}</Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        {part.scraped_data ? (
                                                                            <Tooltip label="Visualizar dados scraped">
                                                                                <IconButton
                                                                                    icon={<InfoIcon />}
                                                                                    onClick={() => openJsonModal(part.scraped_data)}
                                                                                    aria-label="Visualizar dados scraped"
                                                                                />
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Badge colorScheme="red">Não encontrado</Badge>
                                                                        )}
                                                                    </Td>
                                                                    <Td>
                                                                        {part.enriched_data ? (
                                                                            <Tooltip label="Visualizar dados enriquecidos">
                                                                                <IconButton
                                                                                    icon={<InfoIcon />}
                                                                                    onClick={() => openJsonModal(part.enriched_data)}
                                                                                    aria-label="Visualizar dados enriquecidos"
                                                                                />
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Badge colorScheme="red">Não encontrado</Badge>
                                                                        )}
                                                                    </Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                </TableContainer>

                                                <Flex mt={4} alignItems="center">
                                                    <IconButton
                                                        aria-label="Página Anterior"
                                                        icon={<ChevronLeftIcon />}
                                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        isDisabled={currentPage === 1}
                                                    />
                                                    <Spacer />
                                                    <Text>Página {currentPage} de {totalPages}</Text>
                                                    <Spacer />
                                                    <IconButton
                                                        aria-label="Próxima Página"
                                                        icon={<ChevronRightIcon />}
                                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                        isDisabled={currentPage === totalPages}
                                                    />
                                                </Flex>
                                            </>
                                        ) : (
                                            <Text>Nenhuma peça disponível para este trabalho.</Text>
                                        )}
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isJsonModalOpen} onClose={onJsonModalClose} size="xl">
                <ModalOverlay />
                <ModalContent bg={bgColor}>
                    <ModalHeader color={textColor}>Dados JSON</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box
                            overflowY="auto"
                            maxHeight="70vh"
                            css={{
                                '&::-webkit-scrollbar': {
                                    width: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'gray',
                                    borderRadius: '24px',
                                },
                            }}
                        >
                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                {formatJson(selectedJson)}
                            </pre>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onJsonModalClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default JobDetailModal;