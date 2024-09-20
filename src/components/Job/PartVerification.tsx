import React, {useState, useEffect} from 'react';
import {
    Box, Button, Flex, Input, Text, VStack, useToast, Heading,
    Table, Thead, Tbody, Tr, Th, Td, Badge, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Link, useColorModeValue,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Icon, Tooltip, SimpleGrid, Image, IconButton, Spinner, Textarea
} from '@chakra-ui/react';
import {JobsService} from '../../client';
import {ExternalLinkIcon, DeleteIcon, RepeatIcon, AddIcon, ChevronUpIcon, ChevronDownIcon} from "@chakra-ui/icons";
import {FiCheckCircle, FiAlertCircle, FiEdit} from "react-icons/fi";

const PartVerificationComponent = ({part, onVerified, currentUser}) => {
    const [enrichedData, setEnrichedData] = useState(part.enriched_corrected_data || part.enriched_data);
    const [isVerified, setIsVerified] = useState(part.status.toLowerCase() === 'verified');
    const [isDataChanged, setIsDataChanged] = useState(false);
    const [verifiedBy, setVerifiedBy] = useState(part.verified_by);
    const [verifiedAt, setVerifiedAt] = useState(part.verified_at);
    const [images, setImages] = useState(part.images || []);
    const [loadingImageActions, setLoadingImageActions] = useState({});
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const {isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose} = useDisclosure();
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        setEnrichedData(part.enriched_corrected_data || part.enriched_data);
        setIsVerified(part.status.toLowerCase() === 'verified');
        setIsDataChanged(false);
        setVerifiedBy(part.verified_by);
        setVerifiedAt(part.verified_at);
        setImages(part.images || []);
    }, [part]);

    const handleVerify = async () => {
        try {
            const dataToSend = {
                is_verified: true,
                enriched_data: isDataChanged ? enrichedData : null,
            };

            const updatedPart = await JobsService.verifyPart(part.id, dataToSend);
            setIsVerified(true);
            setIsDataChanged(false);
            setVerifiedBy(currentUser);
            setVerifiedAt(new Date().toISOString());
            onVerified({
                ...updatedPart,
                verified_by: currentUser,
                verified_at: new Date().toISOString()
            });
            toast({
                title: "Peça verificada",
                description: "A verificação foi salva com sucesso.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao verificar peça:", error);
            toast({
                title: "Erro na verificação",
                description: "Ocorreu um erro ao salvar a verificação.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDataChange = (key, value) => {
        setEnrichedData(prevData => ({...prevData, [key]: value}));
        setIsDataChanged(true);
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        onImageModalOpen();
    };

    const handleImageDelete = async (image) => {
        setLoadingImageActions(prev => ({...prev, [image.id]: true}));
        try {
            await JobsService.deletePartImage(image.id);
            setImages(prevImages => prevImages.filter(img => img.id !== image.id));
            toast({
                title: "Imagem excluída",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao excluir imagem:", error);
            toast({
                title: "Erro ao excluir imagem",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingImageActions(prev => ({...prev, [image.id]: false}));
        }
    };

    const handleImageReplace = async (image, file) => {
        setLoadingImageActions(prev => ({...prev, [image.id]: true}));
        try {
            const updatedImage = await JobsService.replacePartImage(image.id, file);
            setImages(prevImages => prevImages.map(img => img.id === image.id ? updatedImage : img));
            toast({
                title: "Imagem substituída",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao substituir imagem:", error);
            toast({
                title: "Erro ao substituir imagem",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingImageActions(prev => ({...prev, [image.id]: false}));
        }
    };

    const handleImageAdd = async (file) => {
        setLoadingImageActions((prev) => ({...prev, 'add': true}));
        try {
            const formData = new FormData();
            formData.append('file', file);

            const addedImage = await JobsService.addPartImage(part.id, formData);
            setImages((prevImages) => [...prevImages, addedImage]);

            toast({
                title: "Imagem adicionada",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao adicionar imagem:", error);
            toast({
                title: "Erro ao adicionar imagem",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingImageActions((prev) => ({...prev, 'add': false}));
        }
    };

    const renderDataTable = (data, isEditable = false) => (
        <Table size="sm" variant="simple">
            <Thead>
                <Tr>
                    <Th width="30%">Campo</Th>
                    <Th>Valor</Th>
                </Tr>
            </Thead>
            <Tbody>
                {Object.entries(data).map(([key, value]) => (
                    <Tr key={key}>
                        <Td fontWeight="bold">{translateField(key)}</Td>
                        <Td
                            whiteSpace="normal"
                            wordBreak="break-word"
                            maxW="400px"
                        >
                            {renderTableCell(key, value, isEditable)}
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );


    const renderTableCell = (key, value, isEditable) => {
        if (key === 'description' && typeof value === 'string' && value.length > 500) {
            const [isExpanded, setIsExpanded] = React.useState(false);

            return (
                <Box>
                    <Text
                        noOfLines={isExpanded ? undefined : 5}
                        whiteSpace="pre-wrap"
                        mb={2}
                    >
                        {value}
                    </Text>
                    {value.length > 500 && (
                        <Flex
                            alignItems="center"
                            onClick={() => setIsExpanded(!isExpanded)}
                            cursor="pointer"
                            color="blue.500"
                            _hover={{ color: "blue.600" }}
                        >
                            <Text fontWeight="medium" mr={2}>
                                {isExpanded ? "Mostrar menos" : "Mostrar mais"}
                            </Text>
                            <Icon
                                as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                                w={6}
                                h={6}
                            />
                        </Flex>
                    )}
                    {isEditable && (
                        <Textarea
                            value={value}
                            onChange={(e) => handleDataChange(key, e.target.value)}
                            mt={4}
                            rows={10}
                            resize="vertical"
                        />
                    )}
                </Box>
            );
        } else if (key === 'price') {
            return `R$ ${parseFloat(value).toFixed(2)}`;
        } else if (key === 'url') {
            return (
                <Link href={value} isExternal color="teal.500">
                    Open URL <ExternalLinkIcon mx="2px" />
                </Link>
            );
        } else if (key === 'catalog_catalog.application_table') {
            return (
                <Textarea
                    value={value || ''}
                    onChange={(e) => handleDataChange(key, e.target.value)}
                    size="sm"
                    resize="vertical"
                    maxH="100px"
                />
            );
        } else if (isEditable) {
            return (
                <Input
                    value={value || ''}
                    onChange={(e) => handleDataChange(key, e.target.value)}
                />
            );
        } else {
            return typeof value === 'object' ? JSON.stringify(value) : value.toString();
        }
    };


    const translateField = (field) => {
        const translations = {
            'title': 'Título',
            'description': 'Descrição',
            'price': 'Preço',
            'url': 'URL',
            'attributes': 'Atributos',
            'catalog_catalog.code': 'Código do Catálogo',
            'catalog_catalog.description': 'Descrição do Catálogo',
            'catalog_catalog.full_description': 'Descrição Completa',
            'catalog_catalog.application_table': 'Tabela de Aplicação',
            'catalog_catalog.similar_parts': 'Peças Similares',
            'catalog_catalog.brand_producer': 'Marca/Fabricante',
        };
        return translations[field] || field;
    };

    if (part.status.toLowerCase() === 'not_found') {
        return null;
    }

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} borderColor={borderColor} boxShadow="md">
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="md">Código: {part.code}</Heading>
                <Flex alignItems="center">
                    {isVerified ? (
                        <Box textAlign="right">
                            <Badge colorScheme="green" fontSize="0.8em" p={1}>Verificado</Badge>
                            <Text fontSize="sm" mt={1}>Verificado
                                por: {verifiedBy?.full_name || currentUser.full_name}</Text>
                            <Text fontSize="sm">Data: {new Date(verifiedAt).toLocaleString('pt-BR')}</Text>
                        </Box>
                    ) : (
                        <Badge colorScheme="yellow" fontSize="0.8em" p={1}>
                            <Icon as={FiAlertCircle} mr={1}/> Não Verificado
                        </Badge>
                    )}
                </Flex>
            </Flex>

            <SimpleGrid columns={2} spacing={4}>
                <Box>
                    <Heading size="sm" mb={2}>Dados Obtidos:</Heading>
                    {renderDataTable(part.scraped_data || {})}
                </Box>
                <Box>
                    <Heading size="sm" mb={2}>Dados Enriquecidos:</Heading>
                    {renderDataTable(enrichedData || {}, true)}
                </Box>
            </SimpleGrid>

            <Box mt={4}>
                <Heading size="sm" mb={2}>Imagens:</Heading>
                <SimpleGrid columns={[2, 3, 4]} spacing={4}>
                    {images.map((image, index) => (
                        <Box key={`${image.id}-${index}`} position="relative">
                            <Image
                                src={image.url}
                                alt={`Imagem ${index + 1}`}
                                borderRadius="md"
                                objectFit="cover"
                                w="100%"
                                h="150px"
                                onClick={() => handleImageClick(image)}
                                cursor="pointer"
                                opacity={loadingImageActions[image.id] ? 0.5 : 1}
                            />
                            <Flex
                                position="absolute"
                                top={2}
                                right={2}
                                bg="rgba(0,0,0,0.6)"
                                borderRadius="md"
                                p={1}
                            >
                                {loadingImageActions[image.id] ? (
                                    <Spinner size="sm" color="white"/>
                                ) : (
                                    <>
                                        <Tooltip label="Excluir Imagem">
                                            <IconButton
                                                icon={<DeleteIcon/>}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => handleImageDelete(image)}
                                                aria-label="Excluir imagem"
                                            />
                                        </Tooltip>
                                        <Tooltip label="Substituir Imagem">
                                            <IconButton
                                                icon={<RepeatIcon/>}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => {
                                                    const fileInput = document.createElement('input');
                                                    fileInput.type = 'file';
                                                    fileInput.accept = 'image/*';
                                                    fileInput.onchange = (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            handleImageReplace(image, file);
                                                        }
                                                    };
                                                    fileInput.click();
                                                }}
                                                aria-label="Substituir imagem"
                                            />
                                        </Tooltip>
                                    </>
                                )}
                            </Flex>
                        </Box>
                    ))}
                    <Box
                        borderWidth={2}
                        borderStyle="dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        w="100%"
                        h="150px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        cursor="pointer"
                        onClick={() => document.getElementById(`add-image-input-${part.id}`).click()}
                    >
                        {loadingImageActions['add'] ? (
                            <Spinner size="lg" color="gray.400"/>
                        ) : (
                            <VStack>
                                <Icon as={AddIcon} w={8} h={8} color="gray.400"/>
                                <Text color="gray.500">Adicionar Imagem</Text>
                            </VStack>
                        )}
                        <input
                            id={`add-image-input-${part.id}`}
                            type="file"
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    handleImageAdd(file);
                                }
                            }}
                        />
                    </Box>
                </SimpleGrid>
            </Box>

            <Button
                mt={4}
                colorScheme="blue"
                onClick={handleVerify}
                isDisabled={!isDataChanged && isVerified && !images.some(img => img.isDeleted || img.isReplaced)}
                leftIcon={<Icon as={isVerified ? FiEdit : FiCheckCircle}/>}
            >
                {isVerified ? 'Atualizar' : 'Verificar'}
            </Button>

            <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
                <ModalOverlay/>
                <ModalContent bg={bgColor}>
                    <ModalHeader>Visualizar Imagem</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Image src={selectedImage?.url} alt="Imagem selecionada" maxH="70vh" mx="auto"/>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = 'image/*';
                            fileInput.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file && selectedImage) {
                                    handleImageReplace(selectedImage, file);
                                    onImageModalClose();
                                }
                            };
                            fileInput.click();
                        }}>
                            Substituir
                        </Button>
                        <Button variant="ghost" onClick={onImageModalClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PartVerificationComponent;