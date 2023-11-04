import { Avatar, Button, Chip, Typography } from '@mui/material'
import React from 'react'
import { calculateAvatarText, stringToColor } from '../../Common/StaticFunctionsTyped'
import Spacer from '../../Common/Spacer'

type Props = {
    name: String
    onClick: () => void
}

const UserBox = (props: Props) => {

    return (
        <Button variant='contained' size='small' onClick={() => {props.onClick()}}>
            <Avatar sx={{
                bgcolor: stringToColor(props.name)
            }}>
                {calculateAvatarText(props.name)}
            </Avatar >
            <Spacer horizontal={15} />
            <Typography>
                {props.name.replaceAll(/\p{Emoji}+/gu, "").replaceAll(" ", "")}
            </Typography>
        </Button>
    )
}

export default UserBox