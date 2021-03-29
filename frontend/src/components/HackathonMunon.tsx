import React, { useContext, useEffect, useState } from 'react';
import { HackathonMunonContext } from "./../hardhat/SymfoniContext";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

interface Props { }

export const HackathonMunon: React.FC<Props> = () => {
    const hackathon_munon = useContext(HackathonMunonContext)
    const [hackathonName, setHackathonName] = useState("");
    const [hackathons, setHackathons] = useState([] as any);
    useEffect(() => {
        const doAsync = async () => {
            if (!hackathon_munon.instance) return
            const hackaton_count = parseInt((await hackathon_munon.instance.hackathon_count())._hex)
            let hackathons = []
            for (let i = 1; i <= hackaton_count; i++) {
                const hackathon = await hackathon_munon.instance.hackathons(i)
                hackathons.push(
                {
                    id: i,
                    name: hackathon.name,
                    host_addr: hackathon.host_addr,
                    state: hackathon.state,
                    pot: parseInt(hackathon.pot._hex)
                })
            }
            setHackathons(hackathons)
        };
        doAsync();
    }, [hackathon_munon])

    const handleCreateHackathon = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            const tx = await hackathon_munon.instance.createHackathon("", hackathonName)
            await tx.wait()
        }
    }
    return (
        <div>
            <input onChange={(e) => setHackathonName(e.target.value)}></input>
            <button onClick={(e) => handleCreateHackathon(e)}>Create Hackathon</button>
            <ul>
            {hackathons.map(function(item) {
                return <li key={ item.id }><Link to={ "/hackathons/" + item.id } >{item.name}</Link></li>;
            })}
            </ul>
        </div>
    )
}