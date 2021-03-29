import React, { useContext, useEffect, useState } from 'react';
import { HackathonMunonContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';

interface Props { }

enum HackathonState { RegistrationOpen, ReviewEnabled, Finished }

export const Hackathon: React.FC<Props> = () => {
    const hackathon_munon = useContext(HackathonMunonContext)
    const [currentAddress, setCurrentAddress] = useContext(CurrentAddressContext)
    const [current_user_is_participant, setCurrentUserIsParticipant] = useState(false);
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

            const current_user_participation = await hackathon_munon.instance.hackathon_participants(id, currentAddress)
            if (parseInt(current_user_participation.addr) != 0)
                setCurrentUserIsParticipant(true)
            else
                setCurrentUserIsParticipant(false)
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

    const handleEnableReview = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            const tx = await hackathon_munon.instance.enableHackathonReview(id)
            await tx.wait()
        }
    }

    const handleFinish = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            const tx = await hackathon_munon.instance.finishHackathon(id)
            await tx.wait()
        }
    }

    function currentUserIsHost()
    {
        return host_address == currentAddress;
    }

    function isRegistrationOpen()
    {
        return state == HackathonState.RegistrationOpen;
    }

    function isReviewEnabled()
    {
        return state == HackathonState.ReviewEnabled;
    }

    function isFinished()
    {
        return state == HackathonState.Finished;
    }

    function canJoin()
    {
        return isRegistrationOpen() && !current_user_is_participant;
    }

    function canEnableReview()
    {
        return isRegistrationOpen() && currentUserIsHost();
    }

    function canFinish()
    {
        return isReviewEnabled() && currentUserIsHost();
    }

    function canCashout()
    {
        return isFinished() && current_user_is_participant;
    }

    return (
        <div>
            <p>{name}</p>
            <p>State: {state}</p>
            <p>Pot: {pot}</p>
            {canJoin() &&
                <button onClick={(e) => handleJoinHackathon(e)}>Join Hackathon</button>
            }
            {canEnableReview() &&
                <button onClick={(e) => handleEnableReview(e)}>Enable Review</button>
            }
            {canFinish() &&
                <button onClick={(e) => handleFinish(e)}>Finish</button>
            }
            {canCashout() &&
                <button onClick={(e) => handleCashout(e)}>Cashout</button>
            }
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