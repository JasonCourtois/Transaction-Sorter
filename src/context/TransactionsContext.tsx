"use client";

import { Transaction } from "@/app/dashboard/dashboard.types";
import { createContext, useState, useContext, useEffect } from "react";

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const TransactionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false); 

    useEffect(() => {
        // setIsLoading(true)
        // Code could go here to attempt to fetch transactions from backend on load
        // setIsLoading(false)
    }, [])

    return (
        <TransactionContext.Provider value={{transactions, isLoading, setTransactions}}>
            {children}
        </TransactionContext.Provider>
    )
};

export const UseTransactionContext = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error("UseTransactionContext must be used within TransactionContext");
    }
    return context;
}
