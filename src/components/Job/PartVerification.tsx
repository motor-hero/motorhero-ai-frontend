import React, { useState, useEffect } from 'react';
import {
    Box, Button, Flex, Input, Text, VStack, useToast, Heading,
    Table, Thead, Tbody, Tr, Th, Td, Badge, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Link, useColorModeValue, Icon,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react';
import { JobsService } from '../../client';
import { ChevronDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";

const PartVerificationComponent = ({ part, onVerified, currentUser }) => {
    const [enrichedData, setEnrichedData] = useState(part.enriched_data);
    const [isVerified, setIsVerified] = useState(part.status.toLowerCase() === 'verified');
    const [isDataChanged, setIsDataChanged] = useState(false);
    const [verifiedBy, setVerifiedBy] = useState(part.verified_by);
    const [verifiedAt, setVerifiedAt] = useState(part.verified_at);
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const { isOpen: isJsonModalOpen, onOpen: onJsonModalOpen, onClose: onJsonModalClose } = useDisclosure();
    const [selectedJson, setSelectedJson] = useState(null);

    useEffect(() => {
        setEnrichedData(part.enriched_corrected_data || part.enriched_data);
        setIsVerified(part.status.toLowerCase() === 'verified');
        setIsDataChanged(false);
        setVerifiedBy(part.verified_by);
        setVerifiedAt(part.verified_at);
    }, [part]);

    const handleVerify = async () => {
        try {
            const dataToSend = {
                is_verified: true,
                enriched_data: isDataChanged ? enrichedData : null
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
                title: "Parte verificada",
                description: "A verificação foi salva com sucesso.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao verificar parte:", error);
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

    const openJsonModal = (json) => {
        setSelectedJson(json);
        onJsonModalOpen();
    };

    const formatJson = (json) => {
        if (typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch (e) {
                return json;
            }
        }
        return JSON.stringify(json, null, 2);
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
                        <Td fontWeight="bold">{key}</Td>
                        <Td>
                            {key === 'description' && typeof value === 'string' && value.length > 100 ? (
                                <Accordion allowToggle>
                                    <AccordionItem border="none">
                                        <AccordionButton pl={0} _hover={{ bg: 'transparent' }}>
                                            <Text>{value.slice(0, 100)}...</Text>
                                            <AccordionIcon ml={2} />
                                        </AccordionButton>
                                        <AccordionPanel pb={4} pl={0}>
                                            {value}
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                            ) : key === 'price' ? (
                                `R$ ${parseFloat(value).toFixed(2)}`
                            ) : key === 'url' ? (
                                <Link href={value} isExternal color="teal.500">
                                    Abrir URL <ExternalLinkIcon mx="2px" />
                                </Link>
                            ) : isEditable ? (
                                <Input
                                    value={enrichedData[key] || ''}
                                    onChange={(e) => handleDataChange(key, e.target.value)}
                                />
                            ) : (
                                typeof value === 'object' ? JSON.stringify(value) : value.toString()
                            )}
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} borderColor={borderColor}>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="md">Código: {part.code}</Heading>
                {isVerified ? (
                    <Box textAlign="right">
                        <Badge colorScheme="green" fontSize="0.8em" p={1}>Verificado</Badge>
                        <Text fontSize="sm" mt={1}>Verificado por: {verifiedBy?.full_name || currentUser.full_name}</Text>
                        <Text fontSize="sm">Data: {new Date(verifiedAt).toLocaleString('pt-BR')}</Text>
                    </Box>
                ) : (
                    <Badge colorScheme="yellow" fontSize="0.8em" p={1}>Não Verificado</Badge>
                )}
            </Flex>
            <Flex direction={{base: "column", md: "row"}} gap={4}>
                <Box flex={1}>
                    <Heading size="sm" mb={2}>Dados Scraped:</Heading>
                    {renderDataTable(part.scraped_data)}
                </Box>
                <Box flex={1}>
                    <Heading size="sm" mb={2}>Dados Enriquecidos:</Heading>
                    {renderDataTable(enrichedData, true)}
                </Box>
            </Flex>
            <Button
                mt={4}
                colorScheme="blue"
                onClick={handleVerify}
                isDisabled={!isDataChanged && isVerified}
            >
                {isVerified ? 'Atualizar' : 'Verificar'}
            </Button>

            <Modal isOpen={isJsonModalOpen} onClose={onJsonModalClose} size="xl">
                <ModalOverlay/>
                <ModalContent bg={bgColor}>
                    <ModalHeader>Descrição Completa</ModalHeader>
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
                            <pre style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                                {formatJson(selectedJson)}
                            </pre>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onJsonModalClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PartVerificationComponent;