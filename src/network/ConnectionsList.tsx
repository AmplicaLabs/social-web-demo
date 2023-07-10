import React, { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import ConnectionsListProfiles from "./ConnectionsListProfiles";
import styles from "./ConnectionsList.module.css";
import { User, UserAccount } from "../types";
import Title from "antd/es/typography/Title";
import * as dsnpLink from "../dsnpLink";
import { getContext } from "../service/AuthService";

enum ListStatus {
  CLOSED = "CLOSED",
  FOLLOWERS = "FOLLOWERS",
  FOLLOWING = "FOLLOWING",
}

type ConnectionsListProps = {
  account: UserAccount;
  graphRootUser: User;
};

const ConnectionsList = ({
  account,
  graphRootUser,
}: ConnectionsListProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionsList, setConnectionsList] = useState<User[]>([]);

  const fetchConnections = async () => {
    const ctx = getContext();
    const resp = await dsnpLink.userFollowing(ctx, {
      dsnpId: graphRootUser.dsnpId,
    });
    const list: User[] = await Promise.all(
      resp.map((dsnpId) =>
        dsnpLink
          .getProfile(ctx, { dsnpId })
          .then(({ displayHandle, fromId, content }) => {
            try {
              const profile = content ? JSON.parse(content) : {};
              return {
                handle: displayHandle || "",
                dsnpId: fromId,
                profile: profile,
              };
            } catch (e) {
              console.error(e);
              return {
                handle: displayHandle || "",
                dsnpId: fromId,
                profile: {},
              };
            }
          })
      )
    );
    setConnectionsList(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConnections();
  }, [graphRootUser]);

  return (
    <Spin spinning={isLoading} tip="Loading" size="large">
      <div className={styles.root}>
        <Title level={2}>Following ({connectionsList.length})</Title>
        <ConnectionsListProfiles
          account={account}
          graphRootUser={graphRootUser}
          connectionsList={connectionsList}
        />
      </div>
    </Spin>
  );
};

export default ConnectionsList;