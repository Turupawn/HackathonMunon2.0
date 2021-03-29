import React, { useContext, useEffect, useState } from 'react';
import { HackathonMunonContext } from "./../hardhat/SymfoniContext";
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';

interface Props { }

export const Hackathon: React.FC<Props> = () => {
    const hackathon_munon = useContext(HackathonMunonContext)
    const [name, setName] = useState("");
    const [host_address, setHostAddress] = useState("");
    const [state, setState] = useState(0);
    const [pot, setPot] = useState(0);
    const [participants, setParticipants] = useState([] as any);
    let { id } = useParams();
    useEffect(() => {
        const doAsync = async () => {
            if (!hackathon_munon.instance) return
            const hackathon = await hackathon_munon.instance.hackathons(id)
            setName(hackathon.name)
            setHostAddress(hackathon.host_addr)
            setState(hackathon.state)
            setPot(parseInt(hackathon.pot._hex))

            const participants_count = parseInt(await (await hackathon_munon.instance.getParticipantCount(id))._hex)
            let participants = []
            for (let i = 1; i <= participants_count; i++) {
                const participant_address = await hackathon_munon.instance.hackathon_participant_addresses(id,0)
                const participant = await hackathon_munon.instance.hackathon_participants(id,participant_address)
                participants.push(
                {
                    addr: participant.addr,
                    points: parseInt(participant.points._hex)
                })
            }
            setParticipants(participants)
        };
        doAsync();
    }, [hackathon_munon])
    
    const handleJoinHackathon = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            const tx = await hackathon_munon.instance.join(id, { value: BigNumber.from("30000000000000000") })
            await tx.wait()
        }
    }
    
    const handleRateParticipant = async (address, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            //const tx = await hackathon_munon.instance.createHackathon("", hackathonName)
            //await tx.wait()
            console.log(address)
        }
    }

    const handleCashout = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            const tx = await hackathon_munon.instance.cashOut(id)
            await tx.wait()
        }
    }

    return (
        <div>
            <p>{name}</p>
            <p>State: {state}</p>
            <p>Pot: {pot}</p>
            <button onClick={(e) => handleJoinHackathon(e)}>Join Hackathon</button>
            <button onClick={(e) => handleCashout(e)}>Cashout</button>
            <ul>
            {participants.map(function(participant) {
                return  <li key={ participant.addr }>
                            {participant.addr}
                            <input></input>
                            <button onClick={(e) => handleRateParticipant(participant.addr, e)}>Rate Participant</button>
                        </li>;
            })}
            </ul>
        </div>
    )
}

export default Hackathon;