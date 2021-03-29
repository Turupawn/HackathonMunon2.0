import React, { useContext, useEffect, useState } from 'react';
import { HackathonMunonContext, CurrentAddressContext } from "./../hardhat/SymfoniContext";
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { Button, Heading, Form, Radio, Box, Field } from 'rimble-ui';

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
    const [radio_button_ratings, setRadioButtonRatings] = useState([]);
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
            for (let i = 0; i < participants_count; i++) {
                const participant_address = await hackathon_munon.instance.hackathon_participant_addresses(id, i)
                const participant = await hackathon_munon.instance.hackathon_participants(id,participant_address)
                const current_user_participant_rating = parseInt((await hackathon_munon.instance.participant_ratings(id, currentAddress, participant_address))._hex)
                participants.push(
                {
                    id: i,
                    addr: participant.addr,
                    points: parseInt(participant.points._hex),
                    current_user_rating: current_user_participant_rating
                })
                radio_button_ratings.push(current_user_participant_rating)
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

    const handleSubmittRating = async (participant_id, participant_address, e) => {
        e.preventDefault()
        if (!hackathon_munon.instance) throw Error("HackathonMunon instance not ready")
        if (hackathon_munon.instance) {
            const tx = await hackathon_munon.instance.rate(id, participant_address, radio_button_ratings[participant_id])
            await tx.wait()
        }
      };

    const handleRadioButtonClick = (participant_id, e) => {
        let radio_button_ratings_temp = [...radio_button_ratings];
        radio_button_ratings.map((data,index) => {
            if(index == participant_id)
                radio_button_ratings_temp[index] = parseInt(e.target.value);
        });
        setRadioButtonRatings(radio_button_ratings_temp);
    };

    function currentUserIsHost() { return host_address == currentAddress; }
    function isRegistrationOpen() { return state == HackathonState.RegistrationOpen; }
    function isReviewEnabled() { return state == HackathonState.ReviewEnabled; }
    function isFinished() { return state == HackathonState.Finished; }
    function canJoin() { return isRegistrationOpen() && !current_user_is_participant; }
    function canEnableReview() { return isRegistrationOpen() && currentUserIsHost(); }
    function canFinish() { return isReviewEnabled() && currentUserIsHost(); }
    function canCashout() { return isFinished() && current_user_is_participant; }

    return (
        <div>
            <Heading mb={4} as={"h1"}>{name}</Heading>
            {isRegistrationOpen() &&
                <p>Registrations Open!</p>
            }
            {isReviewEnabled() &&
                <p>Reviews are now happening</p>
            }
            {isFinished() &&
                <p>This event has finished</p>
            }
            <p>Pot: {pot}</p>
            {canJoin() &&
                <Button onClick={(e) => handleJoinHackathon(e)}>Join Hackathon</Button>
            }
            {canEnableReview() &&
                <Button onClick={(e) => handleEnableReview(e)}>Enable Review</Button>
            }
            {canFinish() &&
                <Button onClick={(e) => handleFinish(e)}>Finish</Button>
            }
            {canCashout() &&
                <Button onClick={(e) => handleCashout(e)}>Cashout</Button>
            }
            <ul>
            <Heading mb={4} as={"h2"}>Participants</Heading>
            {participants.map(function(participant) {
                return <li key={ participant.addr }>
                    { participant.addr } 
                    {isReviewEnabled() &&
                        <div>
                            <Box>
                            <Radio
                                label="0"
                                my={2}
                                value={0}
                                checked={radio_button_ratings[participant.id] === 0}
                                onChange={(e) => handleRadioButtonClick(participant.id, e)}
                                />
                                <Radio
                                label="1"
                                my={2}
                                value={1}
                                checked={radio_button_ratings[participant.id] === 1}
                                onChange={(e) => handleRadioButtonClick(participant.id, e)}
                                />
                                <Radio
                                label="2"
                                my={2}
                                value={2}
                                checked={radio_button_ratings[participant.id] === 2}
                                onChange={(e) => handleRadioButtonClick(participant.id, e)}
                                />
                                <Radio
                                label="3"
                                my={2}
                                value={3}
                                checked={radio_button_ratings[participant.id] === 3}
                                onChange={(e) => handleRadioButtonClick(participant.id, e)}
                                />
                                <Radio
                                label="4"
                                my={2}
                                value={4}
                                checked={radio_button_ratings[participant.id] === 4}
                                onChange={(e) => handleRadioButtonClick(participant.id, e)}
                                />
                                <Radio
                                label="5"
                                my={2}
                                value={5}
                                checked={radio_button_ratings[participant.id] === 5}
                                onChange={(e) => handleRadioButtonClick(participant.id, e)}
                                />
                            </Box>
                            <Box>
                                <Button onClick={(e) => handleSubmittRating(participant.id, participant.addr, e)}>
                                    Rate
                                </Button>
                            </Box>
                        </div>
                    }
                </li>;
            })}
            </ul>
        </div>
    )
}

export default Hackathon;