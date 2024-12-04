import React, { useState, useEffect } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import './App.css';
import logo from './assets/logo-removebg-preview.png';

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
    const [placeholder, setPlaceholder] = useState<string>('github');
    const placeholderOptions = ['github', 'dapp', 'web3', 'ao', 'arweave', 'weave', 'decentralised'];

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
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % placeholderOptions.length;
            setPlaceholder(placeholderOptions[index]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        setSearchResults([]);
        if (query.trim()) {
            fetchTransactions(query);
        } else {
            alert('Please enter a search query.');
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col items-center">
                <header className="w-full flex justify-between items-center border-b">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="ark logo" style={{ height: "5rem" }} />
                    </div>
                </header>
                {!searchResults?.length && !loading ? (
                    <>
                        <div
                            style={{ width: "44rem", paddingBottom: "30rem" }}
                            className="flex flex-col justify-center items-center min-h-screen text-center"
                        >
                            <h1 className="text-4xl font-extrabold mb-6 leading-tight tracking-tight text-gray-700">
                                Unlock the Power of Decentralized Knowledge on Arweave
                            </h1>
                            <span className="mb-10 text-lg text-gray-600">
                                Search, Discover D-Apps, tools, and innovations powered by Arweave, all in one place.
                            </span>
                            <div className="relative w-3/4 max-w-2xl flex items-center rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-500 bg-white">
                                <input
                                    type="text"
                                    placeholder={`Search ${placeholder}`}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full px-6 py-4 text-lg rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-300 border-none"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-4 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    style={{
                                        marginLeft: "-0.5px", // Fixes the line by overlapping borders
                                    }}
                                >
                                    Search
                                </button>
                            </div>

                        </div>
                    </>
                ) : (
                    <main className="flex flex-col items-center w-full max-w-3xl p-4">
                        <div className="w-full flex justify-center mb-10">
                            <div className="relative w-3/4 max-w-2xl flex items-center border-2 border-blue-500 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                                <input
                                    type="text"
                                    placeholder={`Search ${placeholder}`}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full px-6 py-4 text-lg border-none rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-4 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="w-full text-justify">
                            {loading && (
                                <div className="w-12 h-12 m-auto mt-2 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
                            )}

                            {!loading && searchResults.length === 0 && query.trim() && (
                                <p className="text-center text-gray-500">
                                    No results found for "{query}". Please try a different keyword.
                                </p>
                            )}

                            {searchResults.length > 0 && (
                                <ul className="space-y-4">
                                    {searchResults.map((tx: TransactionEdge) => {
                                        const titleTag = tx.node.tags.find(
                                            (tag: Tag) => tag.name === 'ars:title'
                                        );
                                        const descriptionTag = tx.node.tags.find(
                                            (tag: Tag) => tag.name === 'ars:description'
                                        );
                                        const redirectTag = tx.node.tags.find(
                                            (tag: Tag) => tag.name === 'ars:redirect'
                                        );

                                        const fetchFavicon = (url: string) => {
                                            const domain = new URL(url).hostname;
                                            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
                                        };

                                        return (
                                            <li
                                                key={tx.node.id}
                                                className="p-4 border rounded-md shadow-md hover:shadow-lg transition bg-gray-100 relative"
                                            >
                                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500 rounded-s-md"></div>
                                                <div className="flex items-start space-x-4 pl-4">
                                                    {redirectTag && (
                                                        <img
                                                            src={fetchFavicon(redirectTag.value)}
                                                            alt="Site Logo"
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div>
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
                                                        {redirectTag && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {redirectTag.value}
                                                            </p>
                                                        )}
                                                        {descriptionTag && (
                                                            <p className="text-sm mt-2">{descriptionTag.value}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </main>
                )}
            </div>
        </>
    );
};

export default App;
