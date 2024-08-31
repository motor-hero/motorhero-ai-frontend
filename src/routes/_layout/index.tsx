import React, { useState, useEffect } from 'react';
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from '@tanstack/react-query';
import {
    Box, Container, Text, Heading, Flex, Stat, StatLabel, StatNumber,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Card, CardHeader, CardBody,
    Progress, Badge,
    Select, Input, Button,
    SimpleGrid, HStack, VStack,
    Spinner, useColorModeValue,
    RadioGroup, Radio, Stack
} from '@chakra-ui/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { JobsService } from '../../client';
import useAuth from "../../hooks/useAuth";

const COLORS = ['#4299E1', '#48BB78', '#ECC94B', '#F56565'];

const statusTranslations = {
    'pending': 'Pendente',
    'in_progress': 'Em Progresso',
    'completed': 'Concluído',
    'failed': 'Falhou'
};

const statusColors = {
    'pending': 'yellow',
    'in_progress': 'blue',
    'completed': 'green',
    'failed': 'red'
};

export const Route = createFileRoute("/_layout/")({
    component: Dashboard,
});

function Dashboard() {
    const { user: currentUser } = useAuth();
    const [filters, setFilters] = useState({
        job_type: '',
        status: '',
        date_range: 'month',
        date_from: '',
        date_to: '',
        page: 1,
        page_size: 20
    });

    useEffect(() => {
        if (filters.date_range !== 'custom') {
            const today = new Date();
            let fromDate = new Date();

            switch (filters.date_range) {
                case 'week':
                    fromDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    fromDate.setMonth(today.getMonth() - 1);
                    break;
                case 'quarter':
                    fromDate.setMonth(today.getMonth() - 3);
                    break;
                case 'year':
                    fromDate.setFullYear(today.getFullYear() - 1);
                    break;
                default:
                    break;
            }

            setFilters(prev => ({
                ...prev,
                date_from: fromDate.toISOString().split('T')[0],
                date_to: today.toISOString().split('T')[0]
            }));
        }
    }, [filters.date_range]);

    const { data, error } = useQuery({
        queryKey: ['dashboardData', filters],
        queryFn: () => JobsService.getDashboardData({
            job_type: filters.job_type || undefined,
            status: filters.status || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            page: filters.page,
            page_size: filters.page_size
        }),
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleDateRangeChange = (value) => {
        setFilters(prev => ({ ...prev, date_range: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    if (error) return <Text>Erro ao carregar dados do painel: {error.message}</Text>;

    const jobTypeData = data ? Object.entries(data.job_type_distribution).map(([name, value]) => ({ name: name === 'SCRAPING' ? 'Scraping' : 'Enriquecimento', value })) : [];
    const statusData = data ? Object.entries(data.status_distribution).map(([name, value]) => ({ name: statusTranslations[name.toLowerCase()], value })) : [];

    return (
        <Container maxW="full" p={4}>
            <Box pt={12} mb={8}>
                <Heading size="xl" mb={2}>Painel de Controle</Heading>
                <Text fontSize="lg">
                    Olá, {currentUser?.full_name || currentUser?.email} 👋🏼
                </Text>
                <Text>Bem-vindo ao seu painel de controle.</Text>
            </Box>

            <VStack spacing={8} align="stretch">
                <Card>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <HStack>
                                <Select name="job_type" value={filters.job_type} onChange={handleFilterChange}>
                                    <option value="">Todos os Tipos</option>
                                    <option value="scraping">Scraping</option>
                                    <option value="enrichment">Enriquecimento</option>
                                </Select>
                                <Select name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="">Todos os Status</option>
                                    <option value="pending">Pendente</option>
                                    <option value="in_progress">Em Progresso</option>
                                    <option value="completed">Concluído</option>
                                    <option value="failed">Falhou</option>
                                </Select>
                            </HStack>
                            <RadioGroup onChange={handleDateRangeChange} value={filters.date_range}>
                                <Stack direction="row">
                                    <Radio value="week">Última Semana</Radio>
                                    <Radio value="month">Último Mês</Radio>
                                    <Radio value="quarter">Último Trimestre</Radio>
                                    <Radio value="year">Último Ano</Radio>
                                    <Radio value="custom">Personalizado</Radio>
                                </Stack>
                            </RadioGroup>
                            {filters.date_range === 'custom' && (
                                <HStack>
                                    <Input
                                        type="date"
                                        name="date_from"
                                        value={filters.date_from}
                                        onChange={handleFilterChange}
                                    />
                                    <Input
                                        type="date"
                                        name="date_to"
                                        value={filters.date_to}
                                        onChange={handleFilterChange}
                                    />
                                </HStack>
                            )}
                        </VStack>
                    </CardBody>
                </Card>

                {data && (
                    <>
                        <SimpleGrid columns={{base: 1, md: 3}} spacing={6}>
                            <Stat>
                                <StatLabel>Total de Trabalhos</StatLabel>
                                <StatNumber>{data.total_jobs}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Custo Médio Estimado</StatLabel>
                                <StatNumber>$ {data.average_cost.toFixed(3)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Tempo Médio Estimado</StatLabel>
                                <StatNumber>{(data.average_time / 3600).toFixed(2)} horas</StatNumber>
                            </Stat>
                        </SimpleGrid>

                        <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                            <Card>
                                <CardHeader>
                                    <Heading size="md">Distribuição por Tipo de Trabalho</Heading>
                                </CardHeader>
                                <CardBody>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={jobTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {jobTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Heading size="md">Distribuição por Status</Heading>
                                </CardHeader>
                                <CardBody>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={statusData}>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Bar dataKey="value" fill="#4299E1"/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <Card>
                            <CardHeader>
                                <Heading size="md">Estatísticas de Peças</Heading>
                            </CardHeader>
                            <CardBody>
                                <SimpleGrid columns={{base: 1, md: 2, lg: 3}} spacing={6}>
                                    <Stat>
                                        <StatLabel>Total de Peças</StatLabel>
                                        <StatNumber>{data.part_statistics.total_parts}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Peças Enriquecidas</StatLabel>
                                        <StatNumber>{data.part_statistics.parts_enriched}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Peças Verificadas</StatLabel>
                                        <StatNumber>{data.part_statistics.parts_verified}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Peças Não Encontradas (Scraping)</StatLabel>
                                        <StatNumber>{data.part_statistics.parts_not_found}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Taxa de Sucesso de Enriquecimento</StatLabel>
                                        <StatNumber>{data.part_statistics.enrichment_success_rate.toFixed(2)}%</StatNumber>
                                    </Stat>
                                </SimpleGrid>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Heading size="md">Detalhes dos Trabalhos</Heading>
                            </CardHeader>
                            <CardBody>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>ID do Trabalho</Th>
                                                <Th>Tipo</Th>
                                                <Th>Status</Th>
                                                <Th>Custo Estimado</Th>
                                                <Th>Tempo Estimado</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data.jobs.map(job => (
                                                <Tr key={job.id}>
                                                    <Td>{job.id}</Td>
                                                    <Td>{job.type === 'SCRAPING' ? 'Scraping' : 'Enriquecimento'}</Td>
                                                    <Td>
                                                        <Badge colorScheme={statusColors[job.status.toLowerCase()]}>
                                                            {statusTranslations[job.status.toLowerCase()]}
                                                        </Badge>
                                                    </Td>
                                                    <Td>$ {job.estimated_cost?.toFixed(3) || 'N/A'}</Td>
                                                    <Td>{job.estimated_time ? `${(job.estimated_time / 3600).toFixed(2)} horas` : 'N/A'}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                                <Flex justifyContent="space-between" mt={4}>
                                    <Button onClick={() => handlePageChange(filters.page - 1)} isDisabled={filters.page === 1}>
                                        Anterior
                                    </Button>
                                    <Text>Página {filters.page} de {data.total_pages}</Text>
                                    <Button onClick={() => handlePageChange(filters.page + 1)}
                                            isDisabled={filters.page === data.total_pages}>
                                        Próxima
                                    </Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </>
                )}
            </VStack>
        </Container>
    );
}

export default Dashboard;