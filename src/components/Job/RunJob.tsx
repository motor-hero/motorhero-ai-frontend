import React from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Spinner,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JobsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { ApiError } from "../../client";

interface RunJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any;
}

const RunJobModal = ({ isOpen, onClose, job }: RunJobModalProps) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();

    const runJobMutation = useMutation({
        mutationFn: () => {
            return job.type === "scraping"
                ? JobsService.runScrapingJob(job.id)
                : JobsService.runEnrichmentJob(job.id);
        },
        onSuccess: () => {
            showToast("Success!", "Job has started running.", "success");
            queryClient.invalidateQueries(["jobs"]);
            onClose();
        },
        onError: (err: ApiError) => {
            showToast("Error", "Failed to start the job.", "error");
        },
    });

    const handleConfirm = () => {
        runJobMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Confirmação de Execução</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        Você tem certeza que deseja executar o Trabalho ID: "{job.id}"?
                    </Text>
                    {job.type === "enrichment" && (
                        <Text mt={4}>
                            Custo estimado: ${job.estimated_cost.toFixed(3)}
                        </Text>
                    )}
                    <Text mt={4}>
                        Tempo estimado de execução:{" "}
                        {Math.ceil(job.estimated_time / 3600)}{" "}
                        {Math.ceil(job.estimated_time / 3600) > 1 ? "horas" : "minutos"}
                    </Text>
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant={"primary"}
                        mr={3}
                        onClick={handleConfirm}
                        isLoading={runJobMutation.isLoading}
                        spinner={<Spinner size="sm" />}
                    >
                        Confirmar
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RunJobModal;
