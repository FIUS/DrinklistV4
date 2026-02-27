import React, { useEffect, useState } from 'react'
import style from './Federations.module.scss';
import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import Spacer from '../../Common/Spacer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { HINZUFUEGEN } from '../../Common/Internationalization/i18n';
import { doPostRequest } from '../../Common/StaticFunctions';
import FederationsDetail from './FederationsDetail';

type Props = {}

const Federations = (props: Props) => {

    const [name, setname] = useState("")
    const [domain, setdomain] = useState("")

    useEffect(() => {
        //TODO fetch federations from backend and set state
    }, [])


    return (
        <div className={style.container}>
            <Accordion className={style.newMemberContainer} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                >
                    <Typography variant='h5'>Neue Federation hinzufügen</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction={"row"} gap={2}>
                        <TextField
                            label='Drinklist Name'
                            value={name}
                            onChange={(value) => {
                                setname(value.target.value)
                            }}
                            size="small"
                        />
                        <TextField
                            label='Drinklist Domain'
                            value={domain}
                            onChange={(value) => {
                                setdomain(value.target.value)
                            }}
                            size="small"
                        />

                    </Stack>
                    <Spacer vertical={10} />
                    <Button variant='outlined' onClick={() => {
                        if (name !== "" && domain !== "") {
                            //TODO send request to backend to create pending federation
                        }
                    }}>
                        {HINZUFUEGEN}
                    </Button>
                </AccordionDetails>
            </Accordion>
            <Spacer vertical={20} />

            <Stack direction="row" gap={2} alignItems={"center"}>

                <FederationsDetail name='stuvus' pending={true} />
                <FederationsDetail name='stuvus' balance={-12.50} />
            </Stack>
        </div>
    )
}

export default Federations