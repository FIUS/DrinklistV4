import { Avatar, Button, Paper, Stack, Typography } from '@mui/material'
import Spacer from '../../Common/Spacer'
import style from './details.module.scss'
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { BITTE_EMPFAENGER, KEIN_VERWENDUNGSZWECK } from '../../Common/Internationalization/i18n';

type Props = {
    name: String,
    amount: number,
    icon: String,
    details: String,
    cancel: () => void,
    accept: () => void,
}

const TransferSummary = (props: Props) => {

    const nameElement = () => {
        if (props.name !== "") {
            return <Typography variant='h4'>
                {props.name.replaceAll(/\p{Emoji}+/gu, "").replaceAll(" ", "")}
            </Typography>
        } else {
            return <Typography sx={{ fontStyle: 'italic' }}>{BITTE_EMPFAENGER}</Typography>
        }
    }
    const description = () => {
        if (props.details === "") {
            return <Typography sx={{ fontStyle: 'italic' }}>{KEIN_VERWENDUNGSZWECK}</Typography>
        } else {
            return <Typography>
                {props.details}
            </Typography>
        }
    }

    const detailElement = () => {
        if (props.icon === "💸" && props.details === "") {
            return <></>
        } else {
            return <Stack className={style.nameHeadline} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Avatar>
                    {props.icon}
                </Avatar >
                {description()}
            </Stack>
        }
    }

    return (
        <Paper sx={{ backgroundColor: "#eeeeee" }} className={style.transferBox}>
            <>
                <Stack className={style.nameHeadline} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <div className={style.nameHeadline}>
                        {nameElement()}
                    </div>
                    <Typography variant='h6'>
                        {props.amount > 0 ? props.amount.toFixed(2) : "__,__"}€
                    </Typography>
                </Stack>
                <Spacer vertical={15} />
                {detailElement()}
                <Spacer vertical={20} />
                <Stack className={style.nameHeadline} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Button color='error' variant='contained' size='small' onClick={()=>{props.cancel()}}>
                        <CloseIcon />
                    </Button>
                    <Button color='success' variant='contained' size='small' onClick={()=>{props.accept()}}>
                        <CheckIcon />
                    </Button>
                </Stack>

            </>
        </Paper>
    )
}

export default TransferSummary