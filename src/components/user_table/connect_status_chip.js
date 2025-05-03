"use client"
import { useUserTable } from "./user_table_provider"

export default function ConnectStatusChip({}) {
    const { socket } = useUserTable()
    return (
        <div className="flex gap-1 items-center">
            <div className={`w-4 h-4 rounded-full ${socket?.connected ? 'bg-success-green': 'bg-failure-red'}`}/><span>{socket?.connected ? " Connected" : " Disconnected"}</span>
        </div>
    )
}