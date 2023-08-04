let websocketConnection = null;

export const setWebSocketConnection = (ws) => {
    websocketConnection = ws;
}

export const getWebSocketConnection = () => {
    return websocketConnection;
}