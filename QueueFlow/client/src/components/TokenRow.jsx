import StatusBadge from "./StatusBadge";

export default function TokenRow({ token, actions }) {
  return (
    <tr>
      <td>
        <strong>{token.tokenLabel || `#${token.tokenNumber}`}</strong>
      </td>
      <td>
        {token.userId?.name}
        <br />
        <small>{token.userId?.phone}</small>
      </td>
      <td>
        <StatusBadge status={token.status} />
      </td>
      <td>{token.positionInQueue ?? "—"}</td>
      <td>
        {token.estimatedWaitMinutes != null
          ? `${token.estimatedWaitMinutes} min`
          : "—"}
      </td>
      {actions && <td className="actions-cell">{actions}</td>}
    </tr>
  );
}
