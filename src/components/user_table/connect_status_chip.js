"use client"
import { useUserTable } from "./user_table_provider"

export default function ConnectStatusChip({}) {
    const { isConnected } = useUserTable();
    return (
        <div className="flex gap-1 items-center">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-success-green': 'bg-failure-red'}`}/><span>{isConnected ? " Connected" : " Disconnected"}</span>
        </div>
    )
}