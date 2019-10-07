import React, { useEffect, useContext } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import {
  TouchableOpacity,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  getOrdersForCustomer,
} from '../../actions';
import { Text } from '../common';
import OrderListItem from './OrderListItem';
import { ThemeContext } from '../../theme';

import { NAVIGATION_HOME_SCREEN_PATH } from '../../navigation/routes';

const OrdersScreen = ({
  orders,
  customerId,
  currencySymbol,
  refreshing,
  getOrdersForCustomer: _getOrdersForCustomer,
  navigation,
}) => {
  const theme = useContext(ThemeContext);

  useEffect(() => {
    _getOrdersForCustomer(customerId);
  }, []);

  const onRefresh = () => {
    _getOrdersForCustomer(customerId, true);
  };

  const renderItem = orderItem => (
    <OrderListItem item={orderItem.item} currencySymbol={currencySymbol} />
  );

  const renderOrderList = () => {
    const data = orders.sort((b, a) => moment(a.created_at).diff(b.created_at));

    return (
      <FlatList
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
)}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  const renderEmptyOrderList = () => {
    const { navigate } = navigation;
    return (
      <View style={styles.emptyListContainerStyle(theme)}>
        <Text type="heading" style={styles.textStyle(theme)}>
          Oops, there is no orders yet
        </Text>
        <TouchableOpacity
          onPress={() => navigate(NAVIGATION_HOME_SCREEN_PATH)}
        >
          <Text type="heading" bold style={styles.buttonTextStyle(theme)}>
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (orders && orders.length) {
    return (
      <View style={styles.container(theme)}>
        {renderOrderList()}
      </View>
    );
  }
  return renderEmptyOrderList();
};

OrdersScreen.navigationOptions = () => ({
  title: 'Orders',
  headerBackTitle: ' ',
});

const styles = {
  container: theme => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  emptyListContainerStyle: theme => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  }),
  textStyle: theme => ({
    paddingTop: theme.spacing.small,
  }),
  buttonTextStyle: theme => ({
    padding: theme.spacing.large,
    top: 0,
    color: theme.colors.secondary,
  }),
};

OrdersScreen.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object),
  customerId: PropTypes.number,
  currencySymbol: PropTypes.string.isRequired,
  refreshing: PropTypes.bool.isRequired,
  getOrdersForCustomer: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

OrdersScreen.defaultProps = {
  orders: null,
  customerId: null,
};

const mapStateToProps = ({ account, magento }) => {
  const customerId = account.customer ? account.customer.id : null;
  const { default_display_currency_symbol: currencySymbol } = magento.currency;
  const orders = account.orderData ? account.orderData.items : [];
  return {
    customerId,
    orders,
    refreshing: account.refreshing,
    currencySymbol,
  };
};

export default connect(mapStateToProps, {
  getOrdersForCustomer,
})(OrdersScreen);
