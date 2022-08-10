import { LocalFireDepartment } from '@mui/icons-material'
import React from 'react'
import { Member } from '../../../../types/ResponseTypes'
import StatisticBox from '../../../Common/InfoBox/StatisticBox'
import { MEISTE_SCHULDEN, NO_USERS } from '../../../Common/Internationalization/i18n'

type Props = {
    members: Array<Member> | null
}

const TopDepter = (props: Props) => {

    const calcTopDepter = () => {
        if (props.members?.length === 0 || !props.members) {
            return NO_USERS
        }
        let balance = props.members[0].balance
        let username = props.members[0].name
        props.members.forEach(member => {
            if (member.balance < balance) {
                balance = member.balance;
                username = member.name
            }
        })
        return `${username} (${balance.toFixed(2)}€)`
    }

    return (
        <StatisticBox
            headline={MEISTE_SCHULDEN}
            text={calcTopDepter()}
            icon={<LocalFireDepartment />}
            colorCode={window.globalTS.ICON_COLOR} />
    )
}

export default TopDepter