let websocketConnection = null;
let ws_uuid = null;

export const setWebSocketConnection = (ws) => {
    websocketConnection = ws;
}

export const getWebSocketConnection = () => {
    return websocketConnection;
}

export const setWebSocketUUID = (uuid) => {
    ws_uuid = uuid;
}

export const getWebSocketUUID = () => {
    return ws_uuid;
}