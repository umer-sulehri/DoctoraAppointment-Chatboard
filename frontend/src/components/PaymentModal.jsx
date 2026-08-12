import React, { useState, useEffect } from 'react';
import { API } from '../services/api';

const PaymentModal = ({ isOpen, onClose, appointment, onPaymentSubmitted }) => {
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [selectedGateway, setSelectedGateway] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copied, setCopied] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadPaymentConfig();
        }
    }, [isOpen]);

    const loadPaymentConfig = async () => {
        try {
            setConfigLoading(true);
            const res = await API.getPaymentConfig();
            setPaymentConfig(res.data.config);
        } catch (err) {
            setError('Failed to load payment configuration.');
        } finally {
            setConfigLoading(false);
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(label);
            setTimeout(() => setCopied(''), 2000);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGateway) {
            setError('Please select a payment method.');
            return;
        }
        if (!transactionId.trim()) {
            setError('Please enter your Transaction ID.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await API.submitPayment(appointment.id, {
                payment_gateway: selectedGateway,
                transaction_id: transactionId.trim(),
                payment_reference: paymentReference.trim(),
            });
            setSuccess('Payment proof submitted! The doctor/admin will verify it shortly.');
            onPaymentSubmitted && onPaymentSubmitted();
            setTimeout(() => {
                onClose();
                setSuccess('');
                setSelectedGateway('');
                setTransactionId('');
                setPaymentReference('');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const gatewayOptions = [];
    if (paymentConfig?.jazzcash_number) gatewayOptions.push({ id: 'jazzcash', label: 'JazzCash', icon: '📱', color: '#e74c3c' });
    if (paymentConfig?.easypaisa_number) gatewayOptions.push({ id: 'easypaisa', label: 'EasyPaisa', icon: '💚', color: '#27ae60' });
    if (paymentConfig?.bank_account_number) gatewayOptions.push({ id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', color: '#2980b9' });

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>💳 Online Payment</h2>
                        <p style={styles.subtitle}>
                            Dr. {appointment?.doctor?.user?.name} — Consultation Fee:
                            <strong style={{ color: '#6c63ff' }}> PKR {appointment?.amount || appointment?.doctor?.consultation_fee}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {configLoading ? (
                    <div style={styles.loading}>
                        <div style={styles.spinner}></div>
                        <p>Loading payment options...</p>
                    </div>
                ) : (
                    <div style={styles.body}>
                        {error && <div style={styles.errorMsg}>{error}</div>}
                        {success && <div style={styles.successMsg}>{success}</div>}

                        {/* Step 1: Select Gateway */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Step 1: Choose Payment Method</h3>
                            <div style={styles.gatewayGrid}>
                                {gatewayOptions.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setSelectedGateway(g.id)}
                                        style={{
                                            ...styles.gatewayCard,
                                            borderColor: selectedGateway === g.id ? g.color : 'rgba(255,255,255,0.1)',
                                            background: selectedGateway === g.id
                                                ? `linear-gradient(135deg, ${g.color}22, ${g.color}11)`
                                                : 'rgba(255,255,255,0.04)',
                                            boxShadow: selectedGateway === g.id ? `0 0 0 2px ${g.color}66` : 'none',
                                        }}
                                    >
                                        <span style={styles.gatewayIcon}>{g.icon}</span>
                                        <span style={styles.gatewayLabel}>{g.label}</span>
                                        {selectedGateway === g.id && (
                                            <span style={{ ...styles.checkBadge, background: g.color }}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Account Details */}
                        {selectedGateway && (
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Step 2: Transfer to this Account</h3>
                                <div style={styles.accountCard}>
                                    {selectedGateway === 'jazzcash' && (
                                        <>
                                            <AccountRow label="JazzCash Number" value={paymentConfig.jazzcash_number} onCopy={copyToClipboard} copied={copied} />
                                            {paymentConfig.jazzcash_name && <AccountRow label="Account Name" value={paymentConfig.jazzcash_name} onCopy={copyToClipboard} copied={copied} />}
                                        </>
                                    )}
                                    {selectedGateway === 'easypaisa' && (
                                        <>
                                            <AccountRow label="EasyPaisa Number" value={paymentConfig.easypaisa_number} onCopy={copyToClipboard} copied={copied} />
                                            {paymentConfig.easypaisa_name && <AccountRow label="Account Name" value={paymentConfig.easypaisa_name} onCopy={copyToClipboard} copied={copied} />}
                                        </>
                                    )}
                                    {selectedGateway === 'bank_transfer' && (
                                        <>
                                            {paymentConfig.bank_name && <AccountRow label="Bank Name" value={paymentConfig.bank_name} onCopy={copyToClipboard} copied={copied} />}
                                            <AccountRow label="Account Number" value={paymentConfig.bank_account_number} onCopy={copyToClipboard} copied={copied} />
                                            {paymentConfig.bank_account_name && <AccountRow label="Account Title" value={paymentConfig.bank_account_name} onCopy={copyToClipboard} copied={copied} />}
                                            {paymentConfig.bank_iban && <AccountRow label="IBAN" value={paymentConfig.bank_iban} onCopy={copyToClipboard} copied={copied} />}
                                        </>
                                    )}
                                    {paymentConfig.payment_instructions && (
                                        <div style={styles.instructions}>
                                            <span>ℹ️</span> {paymentConfig.payment_instructions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Submit Proof */}
                        {selectedGateway && (
                            <form onSubmit={handleSubmit} style={styles.section}>
                                <h3 style={styles.sectionTitle}>Step 3: Enter Transaction Details</h3>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Transaction ID / Reference No. *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TXN123456789"
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Screenshot / Proof URL (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Paste image URL or leave blank"
                                        value={paymentReference}
                                        onChange={e => setPaymentReference(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'Submitting...' : '✅ Submit Payment Proof'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const AccountRow = ({ label, value, onCopy, copied }) => (
    <div style={styles.accountRow}>
        <div>
            <span style={styles.accountLabel}>{label}</span>
            <span style={styles.accountValue}>{value}</span>
        </div>
        <button
            onClick={() => onCopy(value, label)}
            style={{
                ...styles.copyBtn,
                background: copied === label ? '#27ae60' : 'rgba(108,99,255,0.2)',
                borderColor: copied === label ? '#27ae60' : 'rgba(108,99,255,0.4)',
            }}
        >
            {copied === label ? '✓ Copied' : '📋 Copy'}
        </button>
    </div>
);

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    },
    modal: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', width: '100%', maxWidth: '580px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '1.5rem 1.5rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(78,205,196,0.1))',
        borderRadius: '20px 20px 0 0',
    },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff' },
    subtitle: { margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' },
    closeBtn: {
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1rem',
        padding: '0.4rem 0.7rem', transition: 'all 0.2s',
    },
    body: { padding: '1.5rem' },
    loading: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '1rem', padding: '3rem', color: 'rgba(255,255,255,0.6)',
    },
    spinner: {
        width: 36, height: 36, border: '3px solid rgba(108,99,255,0.3)',
        borderTop: '3px solid #6c63ff', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    section: { marginBottom: '1.5rem' },
    sectionTitle: {
        fontSize: '0.95rem', fontWeight: 600, color: '#6c63ff',
        margin: '0 0 0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    gatewayGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem' },
    gatewayCard: {
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.4rem', padding: '1rem', border: '2px solid', borderRadius: '12px',
        cursor: 'pointer', transition: 'all 0.25s', color: '#fff', background: 'rgba(255,255,255,0.04)',
    },
    gatewayIcon: { fontSize: '1.8rem' },
    gatewayLabel: { fontSize: '0.85rem', fontWeight: 600 },
    checkBadge: {
        position: 'absolute', top: 8, right: 8, width: 18, height: 18,
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', color: '#fff', fontWeight: 700,
    },
    accountCard: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', overflow: 'hidden',
    },
    accountRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.8rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    accountLabel: { display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' },
    accountValue: { display: 'block', fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '0.5px' },
    copyBtn: {
        border: '1px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem',
        padding: '0.35rem 0.7rem', color: '#fff', transition: 'all 0.2s', whiteSpace: 'nowrap',
    },
    instructions: {
        padding: '0.8rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)',
        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
    },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', fontWeight: 500 },
    input: {
        width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
        color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    },
    submitBtn: {
        width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #6c63ff, #4ecdc4)',
        border: 'none', borderRadius: '12px', color: '#fff', fontSize: '1rem',
        fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s',
        boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
    },
    errorMsg: {
        background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)',
        color: '#e74c3c', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem',
    },
    successMsg: {
        background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.3)',
        color: '#27ae60', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem',
    },
};

export default PaymentModal;
