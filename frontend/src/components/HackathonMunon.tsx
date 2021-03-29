import React, { useContext, useEffect, useState } from 'react';
import { HackathonMunonContext } from "./../hardhat/SymfoniContext";
import { Input, Button, Heading, Box, Text, Card, Link } from 'rimble-ui';
import { BigNumber } from 'ethers';

interface Props { }

export const HackathonMunon: React.FC<Props> = () => {
    const hackathon_munon = useContext(HackathonMunonContext)
    const [hackathonName, setHackathonName] = useState("");
    const [hackathonEntryFee, setHackathonEntryFee] = useState("");
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
            let entry_fee_wei = String(parseFloat(hackathonEntryFee)*1000000000000000000)
            console.log(entry_fee_wei)
            const tx = await hackathon_munon.instance.createHackathon(hackathonName, "", BigNumber.from(entry_fee_wei))
            await tx.wait()
        }
    }
    return (
        <div>
            <Heading mb={4} as={"h1"}>Muñon DApp</Heading>
            <Heading mb={4} as={"h2"}>Join a hackathon</Heading>
            <ul>
            {hackathons.map(function(hackathon) {
                //return <li key={ hackathon.id }><Link to={ "/hackathons/" + hackathon.id } >{hackathon.name}</Link></li>;
                return <Card>
                    <Link href={ "/hackathons/" + hackathon.id }>
                        {hackathon.name}
                    </Link>
                </Card>;
            })}
            </ul>
            <Heading mb={4} as={"h2"}>Create a new Hackathon</Heading>
            <Input onChange={(e) => setHackathonName(e.target.value)} type="text" required={true} placeholder="e.g. My hackathon"></Input>
            <Input onChange={(e) => setHackathonEntryFee(e.target.value)} type="text" required={true} placeholder="e.g. 0.3"></Input>
            <Button onClick={(e) => handleCreateHackathon(e)}>Create Hackathon</Button>
        </div>
    )
}