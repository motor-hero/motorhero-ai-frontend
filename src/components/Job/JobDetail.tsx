import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { JobsService } from '../../client';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Box,
    Heading,
    Text,
    Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Thead,
    Th,
    Flex,
    Spacer,
    IconButton,
    Badge,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    useColorModeValue,
    Tooltip,
    useDisclosure,
    useToast,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    Divider,
    SimpleGrid,
    StatLabel,
    Stat, StatNumber, StatHelpText
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, DownloadIcon, SearchIcon } from '@chakra-ui/icons';
import PartVerificationComponent from "./PartVerification";
import {FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiPackage} from "react-icons/fi";

const JobDetailModal = ({ isOpen, onClose, jobId }) => {
    const queryClient = useQueryClient();
    const currentUser = queryClient.getQueryData(["currentUser"]);
    const [isDownloadingEnriched, setDownloadingEnriched] = useState(false);
    const [isDownloadingScraped, setDownloadingScraped] = useState(false);
    const [isDownloadingImages, setDownloadingImages] = useState(false);
    const { data: job, isLoading, refetch } = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => JobsService.getJob(jobId),
        enabled: isOpen,
    });

    const { data: serviceTypes, isLoading: isLoadingServiceTypes } = useQuery({
        queryKey: ['serviceTypes'],
        queryFn: JobsService.getServiceTypes,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationPage, setVerificationPage] = useState(1);
    const itemsPerPage = 15;
    const verificationItemsPerPage = 5;

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');

    const { isOpen: isJsonModalOpen, onOpen: onJsonModalOpen, onClose: onJsonModalClose } = useDisclosure();
    const [selectedJson, setSelectedJson] = useState(null);

    const toast = useToast();


    const scrollToTop = useCallback(() => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToTop();
        }
    }, [currentPage, verificationPage, isOpen, scrollToTop]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const statusColor = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'green';
            case 'enriched': return 'blue';
            case 'scraped': return 'yellow';
            case 'not_found': return 'red';
            case 'completed': return 'green';
            default: return 'gray';
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

    const filteredParts = useMemo(() => {
        if (!job || !job.parts) return [];
        return job.parts.filter(part =>
            part.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [job, searchQuery]);

    const verifiableParts = useMemo(() => {
        if (!job || !job.parts) return [];
        return job.parts.filter(part => part.status.toLowerCase() !== 'not_found');
    }, [job]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
    const displayedParts = filteredParts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalVerificationPages = Math.ceil(verifiableParts.length / verificationItemsPerPage);
    const displayedVerificationParts = useMemo(() => {
        const startIndex = (verificationPage - 1) * verificationItemsPerPage;
        return verifiableParts.slice(startIndex, startIndex + verificationItemsPerPage);
    }, [verifiableParts, verificationPage]);

    const handlePartVerified = useCallback((updatedPart) => {
        queryClient.setQueryData(['job', jobId], (oldData) => {
            if (!oldData) return oldData;
            const updatedParts = oldData.parts.map(part =>
                part.id === updatedPart.id ? updatedPart : part
            );
            return { ...oldData, parts: updatedParts };
        });
    }, [queryClient, jobId]);

    const handleDownload = async () => {
        try {
            setDownloadingEnriched(true);
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
        } finally {
            setDownloadingEnriched(false);
        }
    };

    const handleDownloadScraped = async () => {
        try {
            setDownloadingScraped(true);
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
        } finally {
            setDownloadingScraped(false);
        }
    };

    const handleDownloadImages = async () => {
        try {
            setDownloadingImages(true);
            const response = await JobsService.downloadImages(jobId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const filename = response.headers.get('content-disposition')?.split('filename*=utf-8\'\'')[1] || `images_${jobId}.zip`;
            const decodedFilename = decodeURIComponent(filename);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', decodedFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Download iniciado",
                description: "O arquivo ZIP está sendo baixado.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao baixar as imagens:", error);
            toast({
                title: "Erro no download",
                description: "Ocorreu um erro ao baixar as imagens. Por favor, tente novamente.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setDownloadingImages(false);
        }
    };

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

    const JobDetailsStat = ({ label, value, icon, helpText, badgeColor }) => (
        <Stat>
            <StatLabel>
                <Flex alignItems="center">
                    <Icon as={icon} mr={2} />
                    {label}
                </Flex>
            </StatLabel>
            <StatNumber>
                {typeof value === 'number' ? (
                    <Badge colorScheme={badgeColor} fontSize="lg" px={2} py={1}>
                        {value}
                    </Badge>
                ) : (
                    value
                )}
            </StatNumber>
            {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Stat>
    );

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
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
                                <Tab>Verificação de Peças</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <Box p={6} mb={6}>
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                                            <JobDetailsStat
                                                label="ID do Trabalho"
                                                value={job.id}
                                                icon={FiPackage}
                                            />
                                            <JobDetailsStat
                                                label="Nome"
                                                value={job.name}
                                                icon={FiPackage}
                                            />
                                            <JobDetailsStat
                                                label="Status"
                                                value={<Badge colorScheme={statusColor(job.status)}>{job.status}</Badge>}
                                                icon={FiCheckCircle}
                                            />
                                            <JobDetailsStat
                                                label="Tipo de Scraping"
                                                value={serviceTypes?.scraping.find((service) => service.id === job.service_type)?.name || 'N/A'}
                                                icon={FiPackage}
                                            />
                                            <JobDetailsStat
                                                label="Tipo de Enriquecimento"
                                                value={serviceTypes?.enrichment.find((service) => service.id === job.parent_job?.service_type)?.name || 'N/A'}
                                                icon={FiPackage}
                                            />
                                            <JobDetailsStat
                                                label="Custo Estimado do Enriquecimento"
                                                value={job.parent_job?.estimated_cost ? `$ ${job.parent_job.estimated_cost.toFixed(2)}` : 'N/A'}
                                                icon={FiDollarSign}
                                            />
                                        </SimpleGrid>

                                        <Divider my={6} />

                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                                            <JobDetailsStat
                                                label="Total de Peças"
                                                value={job.total_parts}
                                                icon={FiPackage}
                                                badgeColor="blue"
                                            />
                                            <JobDetailsStat
                                                label="Peças Processadas"
                                                value={job.processed_parts_count}
                                                icon={FiCheckCircle}
                                                badgeColor="green"
                                            />
                                            <JobDetailsStat
                                                label="Peças Não Encontradas"
                                                value={job.total_not_found_parts_count || 'N/A'}
                                                icon={FiAlertCircle}
                                                badgeColor="red"
                                            />
                                            <JobDetailsStat
                                                label="Peças Verificadas"
                                                value={job.verified_parts_count}
                                                icon={FiCheckCircle}
                                                badgeColor="green"
                                            />
                                            <JobDetailsStat
                                                label="Peças Não Verificadas"
                                                value={job.non_verified_parts_count}
                                                icon={FiAlertCircle}
                                                badgeColor="red"
                                            />
                                        </SimpleGrid>

                                        <Divider my={6} />

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                                            <Tooltip label={new Date(job.created_at).toLocaleString('pt-BR')}>
                                                <Box>
                                                    <Text fontWeight="bold" mb={2}>
                                                        <Icon as={FiClock} mr={2} />
                                                        Criado em:
                                                    </Text>
                                                    <Text>{new Date(job.created_at).toLocaleDateString('pt-BR')}</Text>
                                                </Box>
                                            </Tooltip>
                                            <Tooltip label={new Date(job.updated_at).toLocaleString('pt-BR')}>
                                                <Box>
                                                    <Text fontWeight="bold" mb={2}>
                                                        <Icon as={FiClock} mr={2} />
                                                        Atualizado em:
                                                    </Text>
                                                    <Text>{new Date(job.updated_at).toLocaleDateString('pt-BR')}</Text>
                                                </Box>
                                            </Tooltip>
                                        </SimpleGrid>
                                    </Box>
                                </TabPanel>
                                <TabPanel>
                                    <Box>
                                        <Heading size="md" mb={2} color={textColor}>Peças</Heading>
                                        <InputGroup mb={4}>
                                            <InputLeftElement pointerEvents="none">
                                                <SearchIcon color="gray.300" />
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
                                                                        <Badge colorScheme={statusColor(part.status)}>{part.status}</Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        {part.status.toLowerCase() !== 'not_found' ? (
                                                                            part.scraped_data ? (
                                                                                <Tooltip label="Visualizar dados scraped">
                                                                                    <IconButton
                                                                                        icon={<InfoIcon />}
                                                                                        onClick={() => openJsonModal(part.scraped_data)}
                                                                                        aria-label="Visualizar dados scraped"
                                                                                    />
                                                                                </Tooltip>
                                                                            ) : (
                                                                                <Badge colorScheme="red">Não encontrado</Badge>
                                                                            )
                                                                        ) : (
                                                                            <Text>N/A</Text>
                                                                        )}
                                                                    </Td>
                                                                    <Td>
                                                                        {part.status.toLowerCase() !== 'not_found' ? (
                                                                            part.enriched_data ? (
                                                                                <Tooltip label="Visualizar dados enriquecidos">
                                                                                    <IconButton
                                                                                        icon={<InfoIcon />}
                                                                                        onClick={() => openJsonModal(part.enriched_data)}
                                                                                        aria-label="Visualizar dados enriquecidos"
                                                                                    />
                                                                                </Tooltip>
                                                                            ) : (
                                                                                <Badge colorScheme="red">Não encontrado</Badge>
                                                                            )
                                                                        ) : (
                                                                            <Text>N/A</Text>
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
                                                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                                        isDisabled={currentPage === 1}
                                                    />
                                                    <Spacer />
                                                    <Text>Página {currentPage} de {totalPages}</Text>
                                                    <Spacer />
                                                    <IconButton
                                                        aria-label="Próxima Página"
                                                        icon={<ChevronRightIcon />}
                                                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
                                                icon={<ChevronLeftIcon />}
                                                onClick={() => setVerificationPage((prev) => Math.max(prev - 1, 1))}
                                                isDisabled={verificationPage === 1}
                                            />
                                            <Spacer />
                                            <Text>Página {verificationPage} de {totalVerificationPages}</Text>
                                            <Spacer />
                                            <IconButton
                                                aria-label="Próxima Página"
                                                icon={<ChevronRightIcon />}
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
                                <Button
                                    leftIcon={<DownloadIcon />}
                                    colorScheme="yellow"
                                    mr={3}
                                    onClick={handleDownloadImages}
                                    isLoading={isDownloadingImages}
                                    loadingText="Baixando..."
                                >
                                    Baixar Imagens
                                </Button>
                                <Button
                                    leftIcon={<DownloadIcon />}
                                    colorScheme="blue"
                                    mr={3}
                                    onClick={handleDownload}
                                    isLoading={isDownloadingEnriched}
                                    loadingText="Baixando..."
                                >
                                    Baixar Peças Enriquecidas
                                </Button>
                                <Button
                                    leftIcon={<DownloadIcon />}
                                    colorScheme="green"
                                    mr={3}
                                    onClick={handleDownloadScraped}
                                    isLoading={isDownloadingScraped}
                                    loadingText="Baixando..."
                                >
                                    Baixar Dados Scraped
                                </Button>
                            </>
                        )}
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