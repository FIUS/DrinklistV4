import React from 'react'
import { Button, Stack, Typography } from '@mui/material'
import Spacer from '../../Common/Spacer'
import { doPostRequest } from '../../Common/StaticFunctions'
import { useNavigate } from 'react-router-dom'

type Props = {}

const MainConfigurator = (props: Props) => {
  const navigate = useNavigate();
  const no = () => {
    doPostRequest("config/status", { state: 1 }).then((response) => {
      if (response.code === 200) {
        navigate("/")
      }
    })
  }

  const yes = () => {
    navigate("/config/init")
  }

  return (
    <Stack flexDirection={"column"} flexWrap={"wrap"} justifyContent={"center"} alignItems={"center"} gap={1}>
      <Typography variant='h2'>Wilkommen zur Drinklist</Typography>
      <Typography variant='h5'>Du scheinst die Drinklist zum ersten mal zu benutzen</Typography>
      <Typography variant='h5'>Möchtest du den Konfigurator starten?</Typography>
      <Spacer vertical={10} />
      <Stack flexDirection={"row"} flexWrap={"wrap"} justifyContent={"center"} alignItems={"center"} gap={1}>
        <Button onClick={no} variant='contained'>Nein, weiter zur Drinklist</Button>
        <Button onClick={yes} variant='contained'>Ja, zum Konfigurator</Button>
      </Stack>
    </Stack>
  )
}

export default MainConfigurator