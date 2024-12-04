import React, { useState, useEffect } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import './App.css';
import productLogo from "./assets/search-high-resolution-logo-transparent.png";
import productLogoDark from "./assets/sear_transparent_logo.png";
import Loader from './components/loader';

interface Tag {
    name: string;
    value: string;
}

interface TransactionNode {
    id: string;
    tags: Tag[];
}

interface TransactionEdge {
    node: TransactionNode;
}

const App: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<TransactionEdge[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [placeholder, setPlaceholder] = useState<string>('github'); // Initial placeholder
    const placeholderOptions = ['github', 'dapp', 'web3', 'ao', 'arweave', 'weave', 'decentralised']; // Placeholder options



    const fetchTransactions = async (searchQuery: string) => {
        setLoading(true);
        try {
            const endpoint = 'https://arweave.net/graphql';
            const graphQLClient = new GraphQLClient(endpoint);

            const query = gql`
        query FetchTransactions($values: [String!]!) {
          transactions(tags: [{ name: "ars:tags", values: $values }]) {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
              }
            }
          }
        }
      `;

            const variables = {
                values: [searchQuery.replace(/\s/g, '')],
            };

            const data: any = await graphQLClient.request(query, variables);

            // Filter results based on `ars:redirect` uniqueness
            const uniqueResults: TransactionEdge[] = [];
            const seenRedirects = new Set();

            data.transactions.edges.forEach((tx: TransactionEdge) => {
                const redirectTag = tx.node.tags.find(tag => tag.name === 'ars:redirect');
                if (redirectTag && !seenRedirects.has(redirectTag.value)) {
                    seenRedirects.add(redirectTag.value);
                    uniqueResults.push(tx);
                }
            });

            setSearchResults(uniqueResults);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('An error occurred while fetching transactions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let index = 0; // Start from the first option
        const interval = setInterval(() => {
            index = (index + 1) % placeholderOptions.length; // Cycle through the options
            setPlaceholder(placeholderOptions[index]);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);


    const handleSearch = () => {
        setSearchResults([])
        if (query.trim()) {
            fetchTransactions(query);
        } else {
            alert('Please enter a search query.');
        }
    };

    useEffect(() => {
        document.body.className = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black';
    }, [darkMode]);

    return (
        <div className="min-h-screen flex flex-col items-center">
            {/* Header */}
            <header className="w-full flex justify-between items-center p-4 border-b">
                <div className="flex items-center space-x-2">
                    <img src={darkMode ? productLogoDark : productLogo} alt="se(ar)ch Logo" className="h-10" />
                </div>

                {/* Dark Mode Switch */}
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                    <span className="slider">
                        <span className="circle">
                            <span className="shine shine-1"></span>
                            <span className="shine shine-2"></span>
                            <span className="shine shine-3"></span>
                            <span className="shine shine-4"></span>
                            <span className="shine shine-5"></span>
                            <span className="shine shine-6"></span>
                            <span className="shine shine-7"></span>
                            <span className="shine shine-8"></span>
                            <span className="moon"></span>
                        </span>
                    </span>
                </label>
            </header>

            {/* Main Content */}
            <main className="flex flex-col items-center w-full max-w-3xl p-4">
                <div className="w-full flex justify-center mb-6">
                    <input
                        type="text"
                        placeholder={`Search for tags (e.g., ${placeholder})`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-2/3 px-4 py-2 border rounded-l-md focus:outline-none"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition"
                    >
                        {'SEARCH'}
                    </button>
                </div>

                {/* Search Results */}
                <div className="w-full text-justify">
                    {loading &&
                        <div className="w-12 h-12 m-auto mt-2 rounded-full animate-spin
                      border-2 border-solid border-blue-500 border-t-transparent"></div>
                    }

                    {searchResults.length > 0 && (
                        <ul className="space-y-4">
                            {searchResults.map((tx: TransactionEdge) => {
                                const titleTag = tx.node.tags.find((tag: Tag) => tag.name === 'ars:title');
                                const descriptionTag = tx.node.tags.find((tag: Tag) => tag.name === 'ars:description');
                                const redirectTag = tx.node.tags.find((tag: Tag) => tag.name === 'ars:redirect');

                                const fetchFavicon = (url: string) => {
                                    const domain = new URL(url).hostname;
                                    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
                                };

                                return (
                                    <li key={tx.node.id} className="p-4 border rounded-md shadow-md hover:shadow-lg transition bg-gray-100 relative">
                                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500 rounded-s-md"></div> {/* Blue strip */}
                                        <div className="flex items-start space-x-4 pl-4"> {/* Added padding for left alignment */}
                                            {/* Favicon */}
                                            {redirectTag && (
                                                <img
                                                    src={fetchFavicon(redirectTag.value)}
                                                    alt="Site Logo"
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            )}

                                            {/* Content */}
                                            <div>
                                                {/* Title */}
                                                {titleTag && redirectTag && (
                                                    <a
                                                        href={redirectTag.value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        {titleTag.value}
                                                    </a>
                                                )}

                                                {/* URL */}
                                                {redirectTag && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{redirectTag.value}</p>
                                                )}

                                                {/* Description */}
                                                {descriptionTag && (
                                                    <p className="text-sm mt-2">
                                                        {descriptionTag.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>

                                );
                            })}
                        </ul>
                    )}

                    {/* {!loading && searchResults.length === 0 && query.trim() && (
                        <p className="text-center text-gray-500">No results found for "{query}".</p>
                    )} */}
                </div>

            </main>

            {/* Footer */}
            {/* <footer className="mt-8 p-4 w-full text-center border-t">
        <p>Copyright &copy; 2024. All rights reserved.</p>
      </footer> */}



        </div>
    );
};

export default App;
