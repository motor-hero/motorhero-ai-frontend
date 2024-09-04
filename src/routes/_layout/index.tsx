import React, {useState, useEffect} from 'react';
import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from '@tanstack/react-query';
import {
    Box, Container, Text, Heading, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Card, CardHeader, CardBody,
    Input,
    SimpleGrid, HStack, VStack,
    RadioGroup, Radio, Stack, Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {JobsService} from '../../client';
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
    component: StrategicDashboard,
});

function StrategicDashboard() {
    const {user: currentUser} = useAuth();
    const [filters, setFilters] = useState({
        date_range: 'month',
        date_from: '',
        date_to: '',
    });
    const [serviceTypes, setServiceTypes] = useState({scraping: [], enrichment: []});

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

    useEffect(() => {
        // Fetch service types
        JobsService.getServiceTypes().then(setServiceTypes);
    }, []);

    const {data, error, isLoading} = useQuery({
        queryKey: ['strategicDashboardData', filters],
        queryFn: () => JobsService.getDashboardData({
            date_from: filters.date_from,
            date_to: filters.date_to,
        }),
    });

    const handleDateRangeChange = (value) => {
        setFilters(prev => ({...prev, date_range: value}));
    };

    const safeNumberFormat = (value, decimals = 2) => {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            return value;
        }
        return parsedValue.toFixed(decimals);
    };

    if (error) {
        return (
            <Container maxW="full" p={4}>
                <Box pt={12} mb={8}>
                    <Heading size="xl" mb={2}>Painel Estratégico</Heading>
                    <Text fontSize="lg">
                        Olá, {currentUser?.full_name || currentUser?.email} 👋🏼
                    </Text>
                    <Text>Bem-vindo ao seu painel estratégico.</Text>
                </Box>
                <Container maxW="full" h="100vh" centerContent>
                    <Alert
                        status="error"
                        variant="subtle"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        height="200px"
                        borderRadius="md"
                    >
                        <AlertIcon boxSize="40px" mr={0}/>
                        <AlertTitle mt={4} mb={1} fontSize="lg">
                            Erro ao carregar dados
                        </AlertTitle>
                        <AlertDescription maxWidth="sm">
                            {error.message || "Ocorreu um erro ao carregar os dados do painel. Por favor, tente novamente mais tarde."}
                        </AlertDescription>
                    </Alert>
                </Container>
            </Container>
        );
    }

    if (!data || data?.kpis.length === 0) {
        return (
            <Container maxW="full" p={4}>
                <Box pt={12} mb={8}>
                    <Heading size="xl" mb={2}>Painel Estratégico</Heading>
                    <Text fontSize="lg">
                        Olá, {currentUser?.full_name || currentUser?.email} 👋🏼
                    </Text>
                    <Text>Bem-vindo ao seu painel estratégico.</Text>
                </Box>
            </Container>
        );
    }

    const {
        kpis = {},
        jobTypeDistribution = [],
        statusDistribution = [],
        partStatistics = {},
        dailyJobsData = [],
        efficiencyTrend = [],
        topPerformingServices = []
    } = data;

    // Calculate additional part statistics
    const totalParts = partStatistics.totalParts || 0;
    const verifiedParts = partStatistics.partsVerified || 0;
    const enrichedParts = partStatistics.partsEnriched || 0;
    const notFoundParts = partStatistics.partsNotFound || 0;
    const notVerifiedParts = partStatistics.partsNotVerified;
    const scrapedParts = totalParts - notFoundParts;

    const partStatusData = [
        {name: 'Verificadas', value: verifiedParts},
        {name: 'A Verificar', value: notVerifiedParts},
        {name: 'Não Encontradas', value: notFoundParts},
    ];

    return (
        <Container maxW="full" p={4}>
            <Box pt={12} mb={8}>
                <Heading size="xl" mb={2}>Painel Estratégico</Heading>
                <Text fontSize="lg">
                    Olá, {currentUser?.full_name || currentUser?.email} 👋🏼
                </Text>
                <Text>Bem-vindo ao seu painel estratégico.</Text>
            </Box>

            <VStack spacing={8} align="stretch">
                {/* Date range selection card */}
                <Card>
                    <CardBody>
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
                            <HStack mt={4}>
                                <Input
                                    type="date"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={(e) => setFilters(prev => ({...prev, date_from: e.target.value}))}
                                />
                                <Input
                                    type="date"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters(prev => ({...prev, date_to: e.target.value}))}
                                />
                            </HStack>
                        )}
                    </CardBody>
                </Card>

                {/* KPIs */}
                <SimpleGrid columns={{base: 1, md: 2, lg: 4}} spacing={6}>
                    <Stat>
                        <StatLabel>Total de Trabalhos</StatLabel>
                        <StatNumber>{kpis.totalJobs || 0}</StatNumber>
                        <StatHelpText>
                            <StatArrow type={kpis.jobGrowth >= 0 ? 'increase' : 'decrease'}/>
                            {safeNumberFormat(Math.abs(kpis.jobGrowth))}% em relação ao período anterior
                        </StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Taxa de Sucesso</StatLabel>
                        <StatNumber>{safeNumberFormat(kpis.successRate)}%</StatNumber>
                        <StatHelpText>
                            <StatArrow type={kpis.successRateChange >= 0 ? 'increase' : 'decrease'}/>
                            {safeNumberFormat(Math.abs(kpis.successRateChange))}% em relação ao período anterior
                        </StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Tempo Médio de Processamento</StatLabel>
                        <StatNumber>{safeNumberFormat(kpis.avgProcessingTime)} horas</StatNumber>
                        <StatHelpText>
                            <StatArrow type={kpis.avgProcessingTimeChange <= 0 ? 'increase' : 'decrease'}/>
                            {safeNumberFormat(Math.abs(kpis.avgProcessingTimeChange))}% em relação ao período anterior
                        </StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Custo Médio por Trabalho</StatLabel>
                        <StatNumber>$ {safeNumberFormat(kpis.avgCostPerJob)}</StatNumber>
                        <StatHelpText>
                            <StatArrow type={kpis.avgCostPerJobChange <= 0 ? 'increase' : 'decrease'}/>
                            {safeNumberFormat(Math.abs(kpis.avgCostPerJobChange))}% em relação ao período anterior
                        </StatHelpText>
                    </Stat>
                </SimpleGrid>

                {/* Job Type and Status Distribution */}
                <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                    <Card>
                        <CardHeader>
                            <Heading size="md">Distribuição por Tipo de Trabalho</Heading>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={jobTypeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {jobTypeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip/>
                                    <Legend/>
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
                                <BarChart data={statusDistribution}>
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

                {/* Part Statistics */}
                <Card>
                    <CardHeader>
                        <Heading size="md">Estatísticas de Peças</Heading>
                    </CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{base: 1, md: 2, lg: 3}} spacing={6}>
                            <Stat>
                                <StatLabel>Total de Peças</StatLabel>
                                <StatNumber>{totalParts}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Peças Encontradas (Scraped)</StatLabel>
                                <StatNumber>{scrapedParts}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Peças Enriquecidas</StatLabel>
                                <StatNumber>{enrichedParts}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Peças Verificadas</StatLabel>
                                <StatNumber>{verifiedParts}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Peças a Verificar</StatLabel>
                                <StatNumber>{notVerifiedParts}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Peças Não Encontradas</StatLabel>
                                <StatNumber>{notFoundParts}</StatNumber>
                            </Stat>
                        </SimpleGrid>
                        <Box mt={6}>
                            <Heading size="sm" mb={2}>Distribuição de Status das Peças</Heading>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={partStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {partStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip/>
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardBody>
                </Card>

                {/* Daily Jobs Trend */}
                <Card>
                    <CardHeader>
                        <Heading size="md">Tendência de Trabalhos Diários</Heading>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyJobsData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Line type="monotone" dataKey="jobs" stroke="#8884d8"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* Efficiency Trend (continued) */}
                <Card>
                    <CardHeader>
                        <Heading size="md">Tendência de Eficiência</Heading>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={efficiencyTrend}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis yAxisId="left"/>
                                <YAxis yAxisId="right" orientation="right"/>
                                <Tooltip/>
                                <Legend/>
                                <Area yAxisId="left" type="monotone" dataKey="successRate" name="Taxa de Sucesso (%)"
                                      stroke="#82ca9d" fill="#82ca9d"/>
                                <Area yAxisId="right" type="monotone" dataKey="averageTime" name="Tempo Médio (horas)"
                                      stroke="#8884d8" fill="#8884d8"/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* Top Performing Services */}
                <Card>
                    <CardHeader>
                        <Heading size="md">Top Serviços Performantes</Heading>
                    </CardHeader>
                    <CardBody>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Serviço</Th>
                                        <Th>Tipo</Th>
                                        <Th>Taxa de Sucesso</Th>
                                        <Th>Tempo Médio</Th>
                                        <Th>Custo Médio</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {topPerformingServices.map((service, index) => {
                                        const serviceType = serviceTypes.scraping.find(s => s.id === service.name) ? 'Scraping' :
                                            serviceTypes.enrichment.find(s => s.id === service.name) ? 'Enrichment' : 'Desconhecido';
                                        const serviceName = serviceTypes.scraping.find(s => s.id === service.name)?.name ||
                                            serviceTypes.enrichment.find(s => s.id === service.name)?.name ||
                                            service.name;
                                        return (
                                            <Tr key={index}>
                                                <Td>{serviceName}</Td>
                                                <Td>{serviceType}</Td>
                                                <Td>{safeNumberFormat(service.successRate)}%</Td>
                                                <Td>{safeNumberFormat(service.avgTime)} horas</Td>
                                                <Td>$ {safeNumberFormat(service.avgCost)}</Td>
                                            </Tr>
                                        );
                                    })}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </CardBody>
                </Card>

                {/* Service Type Performance Comparison */}
                <Card>
                    <CardHeader>
                        <Heading size="md">Comparação de Desempenho por Tipo de Serviço</Heading>
                    </CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                            <Box>
                                <Heading size="sm" mb={2}>Serviços de Scraping</Heading>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Serviço</Th>
                                                <Th>Taxa de Sucesso</Th>
                                                <Th>Tempo Médio</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topPerformingServices
                                                .filter(service => serviceTypes.scraping.some(s => s.id === service.name))
                                                .map((service, index) => (
                                                    <Tr key={index}>
                                                        <Td>{serviceTypes.scraping.find(s => s.id === service.name)?.name || service.name}</Td>
                                                        <Td>{safeNumberFormat(service.successRate)}%</Td>
                                                        <Td>{safeNumberFormat(service.avgTime)} horas</Td>
                                                    </Tr>
                                                ))
                                            }
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>
                            <Box>
                                <Heading size="sm" mb={2}>Serviços de Enriquecimento</Heading>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Serviço</Th>
                                                <Th>Taxa de Sucesso</Th>
                                                <Th>Tempo Médio</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topPerformingServices
                                                .filter(service => serviceTypes.enrichment.some(s => s.id === service.name))
                                                .map((service, index) => (
                                                    <Tr key={index}>
                                                        <Td>{serviceTypes.enrichment.find(s => s.id === service.name)?.name || service.name}</Td>
                                                        <Td>{safeNumberFormat(service.successRate)}%</Td>
                                                        <Td>{safeNumberFormat(service.avgTime)} horas</Td>
                                                    </Tr>
                                                ))
                                            }
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
}

export default StrategicDashboard;