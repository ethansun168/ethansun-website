import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>
};

export function Dashboard(props: DashboardProps) {
    const navigate = useNavigate();
    useEffect(() => {
        if (!props.username) {
            navigate('/login');
        }
    }, [props.username, navigate])
    if (!props.username) return <>Loading...</>
    return (
        <>
            Welcome {props.username}!
        </>
    )
}
