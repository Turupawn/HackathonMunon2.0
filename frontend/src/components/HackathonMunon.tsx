import React, { useContext, useEffect, useState } from 'react';
import { HackathonMunonContext } from "./../hardhat/SymfoniContext";
import { Input, Button, Heading, Box, Text, Card, Link, Field, Image } from 'rimble-ui';
import { BigNumber } from 'ethers';
const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

interface Props { }

export const HackathonMunon: React.FC<Props> = () => {
    const hackathon_munon = useContext(HackathonMunonContext)
    const [hackathonName, setHackathonName] = useState("");
    const [hackathonEntryFee, setHackathonEntryFee] = useState("");
    const [image_buffer, setImageBuffer] = useState(null);
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
                    image_hash: hackathon.image_hash,
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



            await ipfs.files.add(image_buffer, (error, result) => {
                if(error) {
                  console.log(error);
                  return;
                }
                let ipfs_image_hash = result[0].hash
                console.log(ipfs_image_hash)
                let entry_fee_wei = String(parseFloat(hackathonEntryFee)*1000000000000000000)
                console.log(entry_fee_wei)
                const tx = hackathon_munon.instance.createHackathon(hackathonName, ipfs_image_hash, BigNumber.from(entry_fee_wei))
              });
        }
    }

    const handleImageChange = async (e) => {
        e.preventDefault()
        const file = e.target.files[0]
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
            setImageBuffer(Buffer.from(reader.result))
        }
        /*
        */
    }

    return (
        <div>
            <Heading mb={4} as={"h1"}>Muñon DApp</Heading>
            <Heading mb={4} as={"h2"}>Join a hackathon</Heading>
            <ul>
            {hackathons.map(function(hackathon) {
                //return <li key={ hackathon.id }><Link to={ "/hackathons/" + hackathon.id } >{hackathon.name}</Link></li>;
                return <Card key={ hackathon.id }>
                    <Image width="200" src={"http://ipfs.io/ipfs/" + hackathon.image_hash}></Image>
                    <Link href={ "/hackathons/" + hackathon.id }>
                        {hackathon.name}
                    </Link>
                </Card>;
            })}
            </ul>
            <Heading mb={4} as={"h2"}>Create a new Hackathon</Heading>
            <Input onChange={(e) => setHackathonName(e.target.value)} type="text" required={true} placeholder="e.g. My hackathon"></Input>
            <Input onChange={(e) => setHackathonEntryFee(e.target.value)} type="text" required={true} placeholder="e.g. 0.3"></Input>
            <Field label="Image">
                <input key="file_upload" type="file" required={true} onChange={(e) => handleImageChange(e)} />
            </Field>
            <Button onClick={(e) => handleCreateHackathon(e)}>Create Hackathon</Button>
        </div>
    )
}