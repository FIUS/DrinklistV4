import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import Spacer from '../../Common/Spacer'
import { useNavigate } from 'react-router-dom'
import style from './configurator.module.scss'
import { doPostRequest } from '../../Common/StaticFunctions'
import { useDispatch } from 'react-redux'
import { openToast } from '../../../Actions/CommonAction'

type Props = {}

const MainConfiguratorInit = (props: Props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const configDrinklist = () => {
        if (adminName === "" || adminPassword === "" || modName === "" || modPassword === "") {
            dispatch(openToast({ message: "Bitte alle Felder ausfüllen", type: 'error' }))
            return
        }

        setprocessingInfoOpen(true)
        
        doPostRequest("config/init", {
            adminName: adminName,
            adminPassword: adminPassword,
            modName: modName,
            modPassword: modPassword,
            users: names.split("\n")
        }).then(response => {
            if (response.code === 200) {
                navigate("/")
            }
        })
    }

    const [adminName, setadminName] = useState("")
    const [adminPassword, setadminPassword] = useState("")
    const [modName, setmodName] = useState("")
    const [modPassword, setmodPassword] = useState("")
    const [names, setnames] = useState("")
    const [processingInfoOpen, setprocessingInfoOpen] = useState(false)

    return (
        <>
            <Stack flexDirection={"column"} flexWrap={"wrap"} justifyContent={"center"} alignItems={"center"} gap={1} className={style.fullWidth}>
                <Stack flexDirection={"column"} flexWrap={"wrap"} justifyContent={"center"} alignItems={"center"} gap={1} className={style.outterBox}>
                    <Typography variant='h2'>Drinklist-Konfigurator</Typography>
                    <Spacer vertical={20} />
                    <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"space-between"} alignItems={"center"} gap={2} className={style.inputBox}>
                        <Typography variant='h5'>Admin Benutzername:</Typography>
                        <TextField value={adminName}
                            onChange={(value) => {
                                setadminName(value.target.value)
                            }} />
                    </Stack>
                    <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"space-between"} alignItems={"center"} gap={2} className={style.inputBox}>
                        <Typography variant='h5'>Admin Passwort:</Typography>
                        <TextField type="password" value={adminPassword}
                            onChange={(value) => {
                                setadminPassword(value.target.value)
                            }} />
                    </Stack>
                    <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"space-between"} alignItems={"center"} gap={2} className={style.inputBox}>
                        <Typography variant='h5'>Moderator Benutzername:</Typography>
                        <TextField value={modName}
                            onChange={(value) => {
                                setmodName(value.target.value)
                            }} />
                    </Stack>
                    <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"space-between"} alignItems={"center"} gap={2} className={style.inputBox}>
                        <Typography variant='h5'>Moderator Passwort:</Typography>
                        <TextField type="password" value={modPassword}
                            onChange={(value) => {
                                setmodPassword(value.target.value)
                            }} />
                    </Stack>
                    <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"space-between"} alignItems={"center"} gap={2} className={style.inputBox}>
                        <Stack>
                            <Typography variant='h5'>Benutzer anlegen:</Typography>
                            <Typography variant='caption'>Ein Nutzer pro Zeile</Typography>
                        </Stack>
                        <TextField
                            multiline
                            value={names}
                            onChange={(value) => {
                                setnames(value.target.value)
                            }}
                        />
                    </Stack>

                    <Spacer vertical={20} />

                    <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"center"} alignItems={"flex-start"} gap={1}>
                        <Button onClick={configDrinklist} variant='contained'>Einrichten</Button>
                    </Stack>
                </Stack>
            </Stack>
            <Dialog open={processingInfoOpen} sx={{ zIndex: 20000000 }} >
                <DialogTitle>Configuriere Drinklist</DialogTitle>
                <DialogContent>
                    <Stack gap={2} alignItems={"center"}>
                        <Typography>Das erstellen der Benutzer kann einige Zeit dauern</Typography>
                        <CircularProgress />
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default MainConfiguratorInit