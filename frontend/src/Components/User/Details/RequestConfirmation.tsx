import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Spacer from '../../Common/Spacer';
import { Button } from '@mui/material';


import style from './details.module.scss'
import { ANFRAGE_GESENDET, PERSONEN_HABEN_BENACHRICHTIGUNG_BEKOMMEN, SCHLIESSEN } from '../../Common/Internationalization/i18n';

type Props = {
    isOpen: boolean,
    close: () => void
}

const RequestConfirmation = (props: Props) => {
    return (
        <Dialog open={props.isOpen} onClose={props.close} sx={{ zIndex: 20000000 }} >
            <DialogTitle>{ANFRAGE_GESENDET}</DialogTitle>
            <DialogContent className={style.transferBox}>
                <DialogContentText>
                    {PERSONEN_HABEN_BENACHRICHTIGUNG_BEKOMMEN}
                </DialogContentText>

                <Spacer vertical={30} />
                <Button onClick={() => { props.close() }}>
                    {SCHLIESSEN}
                </Button>
            </DialogContent>
        </Dialog >
    )
}

export default RequestConfirmation