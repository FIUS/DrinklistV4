import React, { useState } from 'react'
import style from './federations.module.scss';
import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, Grow, Paper, Stack, TextField, Typography } from '@mui/material';
import Spacer from '../../Common/Spacer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { HINZUFUEGEN } from '../../Common/Internationalization/i18n';
import { doPostRequest } from '../../Common/StaticFunctions';

type Props = {
    name: string,
    pending?: boolean,
    balance?: number,
    extern?: boolean
}

const FederationsDetail = (props: Props) => {

    const [isOpen, setisOpen] = useState(false)
    const textColor = props.balance !== undefined && props.balance >= 0 ? "limegreen" : "darkred"

    return (


        <Paper className={style.federationListItem}>
            <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={2} alignItems={"center"}>
                    <Typography variant="h5">
                        {props.name}
                    </Typography>
                    {props.pending ?
                        <Chip
                            label={
                                <span className={style.pendingChipLabel}>
                                    <span className={style.pendingDot} />
                                    Ausstehend
                                </span>
                            }
                        /> : <></>}
                </Stack>
                {props.balance !== undefined ?
                    <Typography variant="h5" style={{ color: textColor, fontWeight: "bold" }}>
                        {props.balance.toFixed(2)}€
                    </Typography> : <></>}

                {props.extern ?
                    <Button variant="contained"
                        color="primary"
                        onClick={() => {
                            //TODO abort pending federation
                        }}>
                        Akzeptieren
                    </Button> : <></>}
                {props.pending ?
                    <Button variant="outlined"
                        color="primary"
                        onClick={() => {
                            //TODO abort pending federation
                        }}>
                        Abbrechen
                    </Button> : <></>}
                {!props.pending ?
                    <>
                        <Grow in={isOpen} unmountOnExit>
                            <Stack direction="column" spacing={2}>
                                <TextField fullWidth label="Betrag" type='number' />
                                <TextField fullWidth label="Sicherheitscode" type='number' />
                            </Stack>
                        </Grow>
                        <Button variant="contained"
                            color="primary"
                            onClick={() => {
                                if (isOpen) {
                                    //TODO send request to balance federation
                                } else {
                                    setisOpen(true)
                                }
                            }}>
                            Ausgleichen
                        </Button>
                        {isOpen ?
                            <Button variant="outlined"
                                color="primary"
                                onClick={() => setisOpen(false)}>
                                Abbrechen
                            </Button> : <></>}
                        <Button variant="contained"
                            color="primary"
                            onClick={() => {
                                //TODO send request to remove federation
                            }}
                            disabled={props.balance !== undefined && props.balance !== 0}>
                            Entfernen
                        </Button> </> : <></>}
            </Stack>
        </Paper >

    )
}

export default FederationsDetail