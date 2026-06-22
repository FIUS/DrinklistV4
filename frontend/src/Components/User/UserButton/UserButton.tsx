import { ArrowForward } from '@mui/icons-material'
import { Avatar, ButtonBase, Paper, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Member } from '../../../types/ResponseTypes'
import { calculateAvatarText, stringToColor } from '../../Common/StaticFunctionsTyped'
import style from './userbutton.module.scss'

type Props = {
    member: Member
}

const UserButton = ({ member }: Props) => {
    const navigate = useNavigate()
    const showUsername = window.globalTS.DASH_SHOW_USERNAME === true
    const displayName = member.alias || member.name

    return (
        <ButtonBase
            className={style.button}
            onClick={() => navigate(`/user/${member.id}`)}
            focusRipple
        >
            <Paper className={style.card} elevation={1}>
                <Avatar
                    className={style.avatar}
                    sx={{ bgcolor: stringToColor(displayName) }}
                >
                    {calculateAvatarText(member.alias, member.name)}
                </Avatar>
                <div className={style.identity}>
                    <Typography variant="h6">{displayName}</Typography>
                    {showUsername ? (
                        member.alias ? (
                            <Typography variant="caption" color="text.secondary">{member.name}</Typography>
                        ) : (
                            <Typography variant="caption" color="text.secondary">Mitglied #{member.id}</Typography>
                        )
                    ) : null}
                </div>
                <ArrowForward color="action" />
            </Paper>
        </ButtonBase>
    )
}

export default UserButton
