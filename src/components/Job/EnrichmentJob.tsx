import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    VStack,
    HStack,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError, JobsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EnrichJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any;
}

const EnrichJobModal = ({ isOpen, onClose, job }: EnrichJobModalProps) => {
    const [selectedEnrichmentType, setSelectedEnrichmentType] = useState("");
    const showToast = useCustomToast();

    const { data: serviceTypes, isLoading: isLoadingServiceTypes } = useQuery({
        queryKey: ['serviceTypes'],
        queryFn: JobsService.getServiceTypes,
    });

    const createEnrichmentJobMutation = useMutation({
        mutationFn: () => {
            if (!job || !job.id) {
                throw new Error("Invalid job data");
            }
            return JobsService.createEnrichmentJob({
                jobId: job.id,
                enrichmentType: selectedEnrichmentType
            });
        },
        onSuccess: (data) => {
            showToast("Success!", `Enrichment job created. Estimated cost: $${data.estimated_cost.toFixed(2)}`, "success");
            onClose(); // Close the modal after showing the toast
        },
        onError: (err: ApiError) => {
            showToast("Error", `Failed to create enrichment job: ${err.message}`, "error");
        },
    });

    const handleEnrichmentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEnrichmentType(e.target.value);
    };

    const handleCreateEnrichmentJob = () => {
        createEnrichmentJobMutation.mutate();
    };

    useEffect(() => {
        if (isOpen && (!job || !job.id)) {
            showToast("Error", "Invalid job data", "error");
            onClose();
        }
    }, [isOpen, job, showToast, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Criar Trabalho de Enriquecimento</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Select
                            placeholder="Selecione o tipo de enriquecimento"
                            onChange={handleEnrichmentTypeChange}
                            isDisabled={isLoadingServiceTypes || createEnrichmentJobMutation.isLoading}
                            value={selectedEnrichmentType}
                        >
                            {serviceTypes?.enrichment.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </Select>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={3}>
                        <Button
                            colorScheme="blue"
                            onClick={handleCreateEnrichmentJob}
                            isLoading={createEnrichmentJobMutation.isLoading}
                            isDisabled={!selectedEnrichmentType}
                        >
                            Criar Trabalho
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EnrichJobModal;
