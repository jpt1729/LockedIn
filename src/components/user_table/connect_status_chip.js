"use client"
import { useSocket } from "./socket";

export default function ConnectStatusChip({}) {
    const { connected } = useSocket();
    return (
        <div className="flex gap-1 items-center">
            <div className={`w-4 h-4 rounded-full ${connected ? 'bg-success-green': 'bg-failure-red'}`}/><span>{connected ? " Connected" : " Disconnected"}</span>
        </div>
    )
}