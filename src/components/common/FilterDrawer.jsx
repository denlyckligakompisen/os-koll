import React from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

const FilterDrawer = ({ 
    isOpen, 
    onClose, 
    items, 
    selectedItem, 
    onSelect, 
    onClear 
}) => {
    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <Drawer.Portal>
                <Drawer.Overlay style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1100,
                }} />
                <Drawer.Content 
                    aria-describedby={undefined}
                    style={{
                        backgroundColor: 'var(--color-bg)',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '24px 24px 0 0',
                        marginTop: '24px',
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1200,
                        outline: 'none',
                        maxHeight: '85vh',
                        boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    <Drawer.Title style={{ 
                        position: 'absolute', 
                        width: '1px', 
                        height: '1px', 
                        padding: 0, 
                        margin: '-1px', 
                        overflow: 'hidden', 
                        clip: 'rect(0, 0, 0, 0)', 
                        whiteSpace: 'nowrap', 
                        borderWidth: 0 
                    }}>
                        Filtrera
                    </Drawer.Title>
                    {/* Drag Handle */}
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--color-bg)', borderRadius: '24px 24px 0 0' }}>
                        <div style={{ width: '36px', height: '5px', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '9999px' }} />
                    </div>
                    
                    <div style={{ padding: '0 16px 32px 16px', overflowY: 'auto' }}>
                        <div style={{
                            backgroundColor: 'var(--color-card-bg)',
                            borderRadius: '16px',
                            overflow: 'hidden'
                        }}>
                            {selectedItem && (
                                <div 
                                    onClick={() => {
                                        onClear();
                                        onClose();
                                    }}
                                    style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                        color: 'var(--color-text)',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {selectedItem.icon}
                                        <span style={{ fontWeight: '500', fontSize: '1rem' }}>{selectedItem.label}</span>
                                    </div>
                                    <X size={20} strokeWidth={2.5} />
                                </div>
                            )}
                            {items
                                .filter(item => !selectedItem || item.id !== selectedItem.id)
                                .map((item, idx, arr) => (
                                <div 
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item.id);
                                        onClose();
                                    }}
                                    style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        borderBottom: idx < arr.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                        cursor: 'pointer',
                                        backgroundColor: 'var(--color-card-bg)'
                                    }}
                                >
                                    {item.icon}
                                    <span style={{ fontWeight: '500', fontSize: '1rem' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default FilterDrawer;
