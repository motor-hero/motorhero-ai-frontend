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
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {JobsService} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import {ApiError} from "../../client";

interface RunJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any;
}

const RunJobModal = ({isOpen, onClose, job}: RunJobModalProps) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();

    const runJobMutation = useMutation({
        mutationFn: () => JobsService.runScrapingJob(job.id),
        onSuccess: () => {
            showToast("Success!", "Job has started running.", "success");
            queryClient.invalidateQueries(["jobs"]); // Refresh jobs list
            onClose();
        },
        onError: (err: ApiError) => {
            showToast("Error", "Trabalho já executado", "error");
        },
    });

    const handleConfirm = () => {
        runJobMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent style={{
                width: "400px",
                padding: "20px",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                flexDirection: "column",
                margin: "auto",
                alignContent: "center"
            }}>
                <ModalHeader>Confirmação de Execução</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Text>
                        Você tem certeza que deseja executar o Trabalho ID: "{job.id}"?
                    </Text>
                    <Text mt={4}>
                        Tempo estimado de execução :{" "}
                        {Math.ceil(job.estimated_time / 3600)} {Math.ceil(job.estimated_time / 3600) > 1 ? "hours" : "minutes"}
                    </Text>
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant={"primary"}
                        mr={3}
                        onClick={handleConfirm}
                        isLoading={runJobMutation.isLoading}
                        spinner={<Spinner size="sm"/>}
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
