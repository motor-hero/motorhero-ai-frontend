import {
    Button,
    Container,
    Flex,
    Heading,
    SkeletonText,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Progress,
    Tooltip,
    Text,
    Box, Badge
} from "@chakra-ui/react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useEffect, useState} from "react";
import {z} from "zod";

import {JobsService} from "../../client";
import ActionsMenuJob from "../../components/Job/ActionsMenu.tsx";
import Navbar from "../../components/Common/Navbar";
import AddJob from "../../components/Job/AddJob";

const jobsSearchSchema = z.object({
    page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/job")({
    component: Jobs,
    validateSearch: (search) => jobsSearchSchema.parse(search),
});

const PER_PAGE = 5;
const statusMapping = {
    pending: "Pendente",
    in_progress: "Em Progresso",
    completed: "Concluído",
    failed: "Falhou",
};

const colorSchemaMapping = {
    pending: "gray",
    in_progress: "blue",
    completed: "green",
    failed: "red",
};

function getJobsQueryOptions({page}: { page: number }) {
    return {
        queryFn: () => JobsService.readJobs({skip: (page - 1) * PER_PAGE, limit: PER_PAGE}),
        queryKey: ["jobs", {page}],
        keepPreviousData: true,
        refetchInterval: 1000,
    };
}

function JobsTable() {
    const queryClient = useQueryClient();
    const {page} = Route.useSearch();
    const navigate = useNavigate({from: Route.fullPath});
    const setPage = (page: number) => navigate({search: (prev) => ({...prev, page})});

    const [serviceTypes, setServiceTypes] = useState({scraping: {}, enrichment: {}});

    const {
        data: jobs,
        isPending,
        isPlaceholderData,
    } = useQuery(getJobsQueryOptions({page}));

    useEffect(() => {
        const fetchServiceTypes = async () => {
            try {
                const services = await JobsService.getServiceTypes();
                const mappedServices = {
                    scraping: services.scraping.reduce((acc, service) => {
                        acc[service.id] = service.name;
                        return acc;
                    }, {}),
                    enrichment: services.enrichment.reduce((acc, service) => {
                        acc[service.id] = service.name;
                        return acc;
                    }, {}),
                };
                setServiceTypes(mappedServices);
            } catch (err) {
                console.error("Falha ao buscar tipos de serviço:", err);
            }
        };

        fetchServiceTypes();
    }, []);

    const hasNextPage = !isPlaceholderData && jobs?.length === PER_PAGE;
    const hasPreviousPage = page > 1;

    useEffect(() => {
        if (hasNextPage) {
            queryClient.prefetchQuery(getJobsQueryOptions({page: page + 1}));
        }
    }, [page, queryClient, hasNextPage]);

    return (
        <>
            <TableContainer>
                <Table size={{base: "sm", md: "md"}}>
                    <Thead>
                        <Tr>
                            <Th>Trabalho</Th>
                            <Th>Etapa</Th>
                            <Th>Status</Th>
                            <Th>Progresso</Th>
                            <Th>Criado em</Th>
                            <Th>Ações</Th>
                        </Tr>
                    </Thead>
                    {isPending ? (
                        <Tbody>
                            <Tr>
                                {new Array(5).fill(null).map((_, index) => (
                                    <Td key={index}>
                                        <SkeletonText noOfLines={1} paddingBlock="16px"/>
                                    </Td>
                                ))}
                            </Tr>
                        </Tbody>
                    ) : (
                        <Tbody>
                            {jobs?.map((job) => (
                                <Tr key={job.id} opacity={isPlaceholderData ? 0.5 : 1}>
                                    <Td>{job.name}</Td>
                                    <Td>{job.step === "scraping" ? "Scraping" : "Enriquecimento"}</Td>
                                    <Td>
                                        <Badge
                                            colorScheme={colorSchemaMapping[job.parent_job ? job.parent_job.status : job.status]}>
                                            {job.parent_job ? statusMapping[job.parent_job.status] : statusMapping[job.status]}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Progress
                                                value={job.progress}
                                                size="sm"
                                                colorScheme="green"
                                                width="100%"
                                            />
                                            <Text fontSize="sm" minWidth="60px">
                                                {job.progress.toFixed(1)}%
                                            </Text>
                                        </Box>
                                    </Td>
                                    <Td>{new Date(job.created_at).toLocaleString("pt-BR")}</Td>
                                    <Td>
                                        <ActionsMenuJob type={"Job"} value={job}/>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    )}
                </Table>
            </TableContainer>
            <Flex
                gap={4}
                alignItems="center"
                mt={4}
                direction="row"
                justifyContent="flex-end"
            >
                <Button onClick={() => setPage(page - 1)} isDisabled={!hasPreviousPage}>
                    Anterior
                </Button>
                <span>Página {page}</span>
                <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
                    Próximo
                </Button>
            </Flex>
        </>
    );
}

function Jobs() {
    return (
        <Container maxW="full">
            <Heading size="lg" textAlign={{base: "center", md: "left"}} pt={12}>
                Gerenciamento de Trabalhos
            </Heading>

            <Navbar type={"Job"} addModalAs={AddJob}/>
            <JobsTable/>
        </Container>
    );
}

export default Jobs;
