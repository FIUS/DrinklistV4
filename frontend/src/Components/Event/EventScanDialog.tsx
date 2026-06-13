import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Skeleton } from '@mui/material'
import { Html5Qrcode } from 'html5-qrcode'
import { ABBRECHEN, ERROR_MESSAGE, EVENT_MANUELL, EVENT_QR_CODE_UNGUELTIG, EVENT_QR_VERSION_FALSCH, OK } from '../Common/Internationalization/i18n'

type Props = {
    open: boolean,
    title: string,
    onClose: () => void,
    onScanned: (code: string) => void | Promise<void>
}

const EventScanDialog = (props: Props) => {
    const { open, onScanned, onClose, title } = props
    const regionId = useMemo(() => `qr-reader-${Math.random().toString(36).slice(2, 10)}`, [])
    const [manualCode, setManualCode] = useState('')
    const manualRef = useRef<HTMLInputElement | null>(null)
    const [error, setError] = useState<string | null>(null)
    const scanningRef = useRef(true)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const isRunningRef = useRef(false)
    const onScannedRef = useRef(onScanned)
    const [submitting, setSubmitting] = useState(false)
    const [scannerReady, setScannerReady] = useState(false)

    useEffect(() => {
        onScannedRef.current = onScanned
    }, [onScanned])

    const normalizeCode = (rawCode: string) => {
        const trimmed = rawCode.trim()
        if (trimmed === "") {
            return { error: EVENT_QR_CODE_UNGUELTIG, value: null }
        }

        const lowered = trimmed.toLowerCase()

        if (lowered.startsWith("v1.1,")) {
            const parts = trimmed.split(",")
            if (parts.length < 3) {
                return { error: EVENT_QR_CODE_UNGUELTIG, value: null }
            }
            const extracted = parts[2].trim()
            if (extracted === "") {
                return { error: EVENT_QR_CODE_UNGUELTIG, value: null }
            }
            return { error: null, value: extracted }
        }

        if (lowered.startsWith("v")) {
            return { error: EVENT_QR_VERSION_FALSCH, value: null }
        }

        return { error: null, value: trimmed }
    }

    useEffect(() => {
        if (!open) {
            return
        }

        setManualCode('')
        setError(null)
        // focus the manual input shortly after opening
        setTimeout(() => {
            try {
                manualRef.current?.focus()
            } catch {
                // ignore
            }
        }, 50)
        scanningRef.current = true
        let cancelled = false
        let retryTimeout: number | null = null

        const clearTarget = () => {
            const node = document.getElementById(regionId)
            if (node) {
                node.innerHTML = ""
            }
        }

        const stopScanner = () => {
            const scanner = scannerRef.current
            if (!scanner) {
                return Promise.resolve()
            }

            const doClear = () => {
                try {
                    if (typeof (scanner as any).clear === 'function') {
                        (scanner as any).clear()
                    }
                } catch {
                    // Ignore clear errors after stop.
                }
                scannerRef.current = null
                clearTarget()
                setScannerReady(false)
            }

            if (isRunningRef.current) {
                isRunningRef.current = false
                return scanner.stop().catch(() => {
                    // Ignore stop errors when scanner is not running.
                }).finally(doClear)
            }

            doClear()
            return Promise.resolve()
        }

        const startScanner = () => {
            if (cancelled) {
                return
            }

            const target = document.getElementById(regionId)
            if (!target) {
                retryTimeout = window.setTimeout(startScanner, 50)
                return
            }
            stopScanner().finally(() => {
                if (cancelled) {
                    return
                }
                const scanner = new Html5Qrcode(regionId)
                scannerRef.current = scanner
                const startPromise = scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: 240 },
                    (decodedText) => {
                        if (!scanningRef.current) {
                            return
                        }
                        const parsed = normalizeCode(decodedText)
                        if (parsed.error) {
                            setError(parsed.error)
                            return
                        }
                        scanningRef.current = false
                        if (isRunningRef.current) {
                            isRunningRef.current = false
                            try {
                                scanner.stop().catch(() => { })
                            } catch {
                                // Ignore stop errors when scanner is not running.
                            }
                        }
                        setError(null)
                        if (parsed.value !== null) {
                            try {
                                const maybe = onScannedRef.current(parsed.value)
                                if (maybe && typeof (maybe as any).then === 'function') {
                                    setSubmitting(true)
                                        ; (maybe as Promise<any>).finally(() => setSubmitting(false))
                                }
                            } catch {
                                // ignore
                            }
                        }
                    },
                    () => { }
                )

                startPromise.then(() => {
                    isRunningRef.current = true
                    setScannerReady(true)
                }).catch(() => {
                    setError(ERROR_MESSAGE)
                    setScannerReady(false)
                })
            })
        }

        startScanner()

        return () => {
            cancelled = true
            if (retryTimeout !== null) {
                window.clearTimeout(retryTimeout)
            }
            scanningRef.current = false
            stopScanner()
        }
    }, [open, regionId])

    const submitManual = () => {
        const parsed = normalizeCode(manualCode)
        if (parsed.error) {
            setError(parsed.error)
            return
        }
        setError(null)
        if (parsed.value !== null) {
            try {
                const maybe = onScannedRef.current(parsed.value)
                if (maybe && typeof (maybe as any).then === 'function') {
                    setSubmitting(true)
                        ; (maybe as Promise<any>).finally(() => setSubmitting(false))
                }
            } catch {
                // ignore
            }
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth keepMounted>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {!scannerReady && !error ? <Skeleton variant="rectangular" height={240} /> : <div id={regionId} style={{ width: '100%' }} />}
                {error ? <Typography color="error" variant="body2">{error}</Typography> : <></>}
                <TextField
                    label={EVENT_MANUELL}
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    inputRef={(el: HTMLInputElement) => { manualRef.current = el }}
                    fullWidth
                    margin="dense"
                    autoComplete="off"
                    autoFocus={false}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>{ABBRECHEN}</Button>
                <Button variant="contained" onClick={submitManual} disabled={submitting}>{OK}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default EventScanDialog
