import React, { useState, useMemo, useCallback } from 'react';
import { Bubble } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useTable, useSortBy } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

// Register all required chart.js components
Chart.register(...registerables);

const Dashboard = () => {
    const [data, setData] = useState([
        { id: 1, name: 'Item 1', revenue: 5000, population: 300 },
        { id: 2, name: 'Item 2', revenue: 7000, population: 500 },
        { id: 3, name: 'Item 3', revenue: 2000, population: 150 },
        { id: 4, name: 'Item 4', revenue: 2500, population: 180 },
        { id: 5, name: 'Item 5', revenue: 3500, population: 220 },
        // More items for testing large datasets
    ]);

    const [filter, setFilter] = useState({ minRevenue: 0, maxRevenue: Infinity });

    // Filter data based on user input
    const filteredData = useMemo(() => 
        data.filter(item => item.revenue >= filter.minRevenue && item.revenue <= filter.maxRevenue), 
        [data, filter]
    );

    // Data for the Bubble chart
    const bubbleData = useMemo(() => ({
        datasets: [
            {
                label: 'Revenue vs Population',
                data: filteredData.map(item => ({
                    x: item.revenue,
                    y: item.population,
                    r: item.revenue / 1000,
                })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                hoverBackgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
        ],
    }), [filteredData]);

    // Define table columns with sorting capabilities
    const columns = useMemo(() => [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Revenue', accessor: 'revenue', sortType: 'basic' },
        { Header: 'Population', accessor: 'population', sortType: 'basic' },
    ], []);

    // React Table instance with sorting feature
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data: filteredData,
    }, useSortBy);

    // Handle bubble click to filter the table by the selected revenue
    const handleBubbleClick = useCallback((elements) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const selectedData = filteredData[index];
            setFilter({
                minRevenue: selectedData.revenue,
                maxRevenue: selectedData.revenue,
            });
        }
    }, [filteredData]);

    // Handle filter input changes with useCallback
    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: +value || 0
        }));
    }, []);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Dashboard</h2>

            {/* Filter section */}
            <div className="mb-4 card shadow-sm">
                <div className="card-body">
                    <h4 className="card-title text-primary">Filter by Revenue</h4>
                    <input
                        type="number"
                        className="form-control mb-2"
                        name="minRevenue"
                        placeholder="Min Revenue"
                        onChange={handleFilterChange}
                    />
                    <input
                        type="number"
                        className="form-control"
                        name="maxRevenue"
                        placeholder="Max Revenue"
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Bubble chart */}
            <div className="mb-4 card shadow-sm">
                <div className="card-body chart-container">
                    <Bubble 
                        data={bubbleData} 
                        getElementAtEvent={handleBubbleClick} 
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: context => `Revenue: ${context.raw.x}, Population: ${context.raw.y}`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Data table with sorting */}
            <div className="table-responsive card shadow-sm">
                <div className="card-body">
                    <table {...getTableProps()} className="table table-striped">
                        <thead className="thead-dark">
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom styles */}
            <style jsx>{`
                .card {
                    border: none;
                    border-radius: 10px;
                }

                .card-title {
                    font-weight: bold;
                    font-size: 1.5rem;
                }

                .table th, .table td {
                    vertical-align: middle;
                }

                .table th {
                    background-color: #007bff;
                    color: white;
                }

                .table-striped tbody tr:nth-of-type(odd) {
                    background-color: #f2f2f2;
                }

                .chart-container {
                    height: 400px;
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 0 15px;
                    }

                    .card {
                        margin-bottom: 15px;
                    }

                    .chart-container {
                        height: 300px;
                    }
                }

                @media (max-width: 576px) {
                    .card-title {
                        font-size: 1.25rem;
                    }

                    .form-control {
                        font-size: 0.9rem;
                    }

                    .table {
                        font-size: 0.9rem;
                    }

                    .chart-container {
                        height: 250px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
