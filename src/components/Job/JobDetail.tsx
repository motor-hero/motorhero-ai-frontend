import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {JobsService} from '../../client';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Button, Box, Heading, Text, Table, Tbody, Tr, Td, TableContainer, Thead, Th,
    Flex, Spacer, IconButton, Badge, Tabs, TabList, Tab, TabPanels, TabPanel,
    useColorModeValue, Tooltip, useDisclosure, useToast, Input, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import {ChevronLeftIcon, ChevronRightIcon, InfoIcon, DownloadIcon, SearchIcon} from '@chakra-ui/icons';
import PartVerificationComponent from "./PartVerification";

const JobDetailModal = ({isOpen, onClose, jobId}) => {
    const queryClient = useQueryClient();
    const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
    const {data: job, isLoading, refetch} = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => JobsService.getJob(jobId),
        enabled: isOpen,
    });

    const {data: serviceTypes, isLoading: isLoadingServiceTypes} = useQuery({
        queryKey: ['serviceTypes'],
        queryFn: JobsService.getServiceTypes,
    });

    const [parts, setParts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationPage, setVerificationPage] = useState(1);
    const itemsPerPage = 15;
    const verificationItemsPerPage = 5;

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');

    const {isOpen: isJsonModalOpen, onOpen: onJsonModalOpen, onClose: onJsonModalClose} = useDisclosure();
    const [selectedJson, setSelectedJson] = useState(null);

    const sortedParts = useMemo(() => {
        if (!job || !job.parts) return [];
        return [...job.parts].sort((a, b) => {
            if (a.status.toLowerCase() !== 'verified' && b.status.toLowerCase() === 'verified') return -1;
            if (a.status.toLowerCase() === 'verified' && b.status.toLowerCase() !== 'verified') return 1;
            return 0;
        });
    }, [job]);

    const toast = useToast();

    useEffect(() => {
        if (job) {
            setParts(job.parts);
        }
    }, [job]);

    const statusColor = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case 'verified':
                return 'green';
            case 'enriched':
                return 'blue';
            case 'scraped':
                return 'yellow';
            case 'completed':
                return 'green';
            default:
                return 'gray';
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

    const handlePartVerified = useCallback((updatedPart) => {
        queryClient.setQueryData(['job', jobId], (oldData) => {
            if (!oldData) return oldData;
            const updatedParts = oldData.parts.map(part =>
                part.id === updatedPart.id ? updatedPart : part
            );
            return { ...oldData, parts: updatedParts };
        });
    }, [queryClient, jobId]);

    useEffect(() => {
        if (isOpen && job) {
            // Reset parts to ensure correct badge status upon opening
            setParts(job.parts);
        }
    }, [isOpen, job]);

// When modal closes, reset verification page state to avoid stale data
    useEffect(() => {
        if (!isOpen) {
            setVerificationPage(1);
        }
    }, [isOpen]);

    const filteredParts = useMemo(() => {
        return parts.filter(part =>
            part.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [parts, searchQuery]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search query changes
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
    const displayedParts = filteredParts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalVerificationPages = Math.ceil(parts.length / verificationItemsPerPage);
    const displayedVerificationParts = useMemo(() => {
        const startIndex = (verificationPage - 1) * verificationItemsPerPage;
        return sortedParts.slice(startIndex, startIndex + verificationItemsPerPage);
    }, [sortedParts, verificationPage]);

    const handleDownload = async () => {
        try {
            const response = await JobsService.downloadEnrichedParts(jobId);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `enriched_parts_${jobId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Download iniciado",
                description: "O arquivo CSV está sendo baixado.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao baixar as peças enriquecidas:", error);
            toast({
                title: "Erro no download",
                description: "Ocorreu um erro ao baixar as peças enriquecidas.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDownloadScraped = async () => {
        try {
            const response = await JobsService.downloadScrapedParts(jobId);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `scraped_parts_${jobId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Download iniciado",
                description: "O arquivo CSV está sendo baixado.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao baixar os dados scraped:", error);
            toast({
                title: "Erro no download",
                description: "Ocorreu um erro ao baixar os dados scraped.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
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
                <ModalOverlay/>
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

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay/>
                <ModalContent bg={bgColor}>
                    <ModalHeader color={textColor}>
                        Detalhes do Trabalho
                        <Badge ml={2} colorScheme={statusColor(job.status)}>{job.status}</Badge>
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Tabs isFitted variant="enclosed">
                            <TabList mb="1em">
                                <Tab>Visão Geral</Tab>
                                <Tab>Peças</Tab>
                                <Tab>Verificação de Peças</Tab>
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
                                                        <Badge
                                                            colorScheme={statusColor(job.status)}>{job.status}</Badge>
                                                    </Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Tipo de Scraping:</Td>
                                                    <Td>{serviceTypes?.scraping.find((service) => service.id === job.service_type)?.name || 'N/A'}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td fontWeight="bold">Tipo de Enriquecimento:</Td>
                                                    <Td>{serviceTypes?.enrichment.find((service) => service.id === job.parent_job?.service_type)?.name || 'N/A'}</Td>
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
                                        <InputGroup mb={4}>
                                            <InputLeftElement pointerEvents="none">
                                                <SearchIcon color="gray.300"/>
                                            </InputLeftElement>
                                            <Input
                                                placeholder="Buscar por código da peça"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </InputGroup>
                                        {displayedParts.length > 0 ? (
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
                                                            {displayedParts.map((part) => (
                                                                <Tr key={part.id}>
                                                                    <Td>{part.code}</Td>
                                                                    <Td>
                                                                        <Badge
                                                                            colorScheme={statusColor(part.status)}>{part.status}</Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        {part.scraped_data ? (
                                                                            <Tooltip label="Visualizar dados scraped">
                                                                                <IconButton
                                                                                    icon={<InfoIcon/>}
                                                                                    onClick={() => openJsonModal(part.scraped_data)}
                                                                                    aria-label="Visualizar dados scraped"
                                                                                />
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Badge colorScheme="red">Não
                                                                                encontrado</Badge>
                                                                        )}
                                                                    </Td>
                                                                    <Td>
                                                                        {part.enriched_data ? (
                                                                            <Tooltip
                                                                                label="Visualizar dados enriquecidos">
                                                                                <IconButton
                                                                                    icon={<InfoIcon/>}
                                                                                    onClick={() => openJsonModal(part.enriched_data)}
                                                                                    aria-label="Visualizar dados enriquecidos"
                                                                                />
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Badge colorScheme="red">Não
                                                                                encontrado</Badge>
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
                                                        icon={<ChevronLeftIcon/>}
                                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        isDisabled={currentPage === 1}
                                                    />
                                                    <Spacer/>
                                                    <Text>Página {currentPage} de {totalPages}</Text>
                                                    <Spacer/>
                                                    <IconButton
                                                        aria-label="Próxima Página"
                                                        icon={<ChevronRightIcon/>}
                                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                        isDisabled={currentPage === totalPages}
                                                    />
                                                </Flex>
                                            </>
                                        ) : (
                                            <Text>Nenhuma peça encontrada com o código especificado.</Text>
                                        )}
                                    </Box>
                                </TabPanel>
                                <TabPanel>
                                    <Box>
                                        <Heading size="md" mb={4}>Verificação de Peças</Heading>
                                        {displayedVerificationParts.map((part) => (
                                            <PartVerificationComponent
                                                key={part.id}
                                                currentUser={currentUser}
                                                part={part}
                                                onVerified={handlePartVerified}
                                            />
                                        ))}
                                        <Flex mt={4} alignItems="center">
                                            <IconButton
                                                aria-label="Página Anterior"
                                                icon={<ChevronLeftIcon/>}
                                                onClick={() => setVerificationPage((prev) => Math.max(prev - 1, 1))}
                                                isDisabled={verificationPage === 1}
                                            />
                                            <Spacer/>
                                            <Text>Página {verificationPage} de {totalVerificationPages}</Text>
                                            <Spacer/>
                                            <IconButton
                                                aria-label="Próxima Página"
                                                icon={<ChevronRightIcon/>}
                                                onClick={() => setVerificationPage((prev) => Math.min(prev + 1, totalVerificationPages))}
                                                isDisabled={verificationPage === totalVerificationPages}
                                            />
                                        </Flex>
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter>
                        {job.parent_job?.status === 'completed' && job.status === 'completed' && (
                            <>
                                <Button leftIcon={<DownloadIcon/>} colorScheme="blue" mr={3} onClick={handleDownload}>
                                    Baixar Peças Enriquecidas
                                </Button>
                                <Button leftIcon={<DownloadIcon/>} colorScheme="green" mr={3}
                                        onClick={handleDownloadScraped}>
                                    Baixar Dados Scraped
                                </Button>
                            </>
                        )}
                        <Button onClick={onClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isJsonModalOpen} onClose={onJsonModalClose} size="xl">
                <ModalOverlay/>
                <ModalContent bg={bgColor}>
                    <ModalHeader color={textColor}>Dados JSON</ModalHeader>
                    <ModalCloseButton/>
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