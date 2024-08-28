import { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { ApiError, JobsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface AddJobProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ServiceTypes {
    scraping: { id: string; name: string }[];
    enrichment: { id: string; name: string }[];
}

const AddJob = ({ isOpen, onClose }: AddJobProps) => {
    const [serviceTypes, setServiceTypes] = useState<ServiceTypes>({
        scraping: [],
        enrichment: [],
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedServiceType, setSelectedServiceType] = useState<string>("");

    const queryClient = useQueryClient();
    const showToast = useCustomToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<{ file: FileList | null; serviceType: string; name: string }>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            file: null,
            serviceType: "",
            name: "",
        },
    });

    useEffect(() => {
        const fetchServiceTypes = async () => {
            try {
                const services = await JobsService.getServiceTypes();
                setServiceTypes({
                    scraping: services.scraping.map((s: any) => ({ id: s.id, name: s.name })),
                    enrichment: services.enrichment.map((s: any) => ({ id: s.id, name: s.name })),
                });
                setSelectedServiceType(services.scraping[0].id);
            } catch (err) {
                handleError(err as ApiError, showToast);
            }
        };

        fetchServiceTypes();
    }, [showToast]);

    const createJobMutation = useMutation({
        mutationFn: (data: FormData) => {
            const queryParams = new URLSearchParams({
                scraper_type: data.get("scraper_type") as string,
                name: data.get("name") as string,
            });
            return JobsService.createScrapingJob(data, queryParams);
        },
        onSuccess: (job) => {
            const estimatedTimeHours = Math.ceil(job.estimated_time / 3600);
            const timeUnit = estimatedTimeHours > 1 ? "horas" : "minutos";
            showToast("Sucesso!", `Trabalho criado com sucesso. Tempo estimado: ${estimatedTimeHours} ${timeUnit}.`, "success");
            reset();
            onClose();
        },
        onError: (err: ApiError) => {
            handleError(err, showToast);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            setIsLoading(false);
        },
    });

    const onSubmit: SubmitHandler<{ file: FileList | null; serviceType: string }> = (data) => {
        if (!data.file || data.file.length === 0) {
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", data.file[0]);
        formData.append("name", data.name);
        formData.append("scraper_type", selectedServiceType);

        createJobMutation.mutate(formData);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} size="md" isCentered>
                <ModalOverlay />
                <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader>Adicionar Trabalho</ModalHeader>
                    {!isLoading && <ModalCloseButton />}
                    <ModalBody pb={6}>

                        <FormControl isRequired isInvalid={!!errors.name}>
                            <FormLabel htmlFor="name">Nome do Trabalho</FormLabel> {/* Add this block */}
                            <Input
                                id="name"
                                placeholder="Digite o nome do trabalho"
                                {...register("name", {
                                    required: "O nome é obrigatório.",
                                })}
                            />
                            {errors.name && (
                                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.file}>
                            <FormLabel htmlFor="file">Enviar Arquivo</FormLabel>
                            <Box display="flex" alignItems="center">
                                <Input
                                    id="file"
                                    type="file"
                                    {...register("file", {
                                        required: "O arquivo é obrigatório.",
                                    })}
                                    sx={{ display: "inline-block", flex: 1 }}
                                />
                            </Box>
                            {errors.file && (
                                <FormErrorMessage>{errors.file.message}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isRequired mt={4}>
                            <FormLabel htmlFor="serviceType">Tipo de Serviço</FormLabel>
                            <Select
                                id="serviceType"
                                value={selectedServiceType}
                                onChange={(e) => setSelectedServiceType(e.target.value)}
                            >
                                {serviceTypes.scraping.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </Select>
                            {errors.serviceType && (
                                <FormErrorMessage>{errors.serviceType.message}</FormErrorMessage>
                            )}
                        </FormControl>
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isSubmitting || isLoading}
                            spinner={<Spinner size="sm" />}
                            isDisabled={isLoading}
                        >
                            Salvar
                        </Button>
                        <Button onClick={onClose} isDisabled={isLoading}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddJob;
