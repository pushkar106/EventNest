
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import {
  IconButton,
  ActivityIndicator,
  Button,
} from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById } from '../store/slices/eventsSlice';


// ==========================================
// EVENT DETAILS SCREEN
// ==========================================

export default function EventDetailsScreen({ route, navigation }) {

  const { id } = route.params;

  const dispatch = useDispatch();

  const { current, loading } = useSelector((s) => s.events);

  const [quantities, setQuantities] = useState({});


  // FETCH EVENT

  useEffect(() => {
    setQuantities({});
    dispatch(fetchEventById(id));
  }, [id, dispatch]);


  // LOADING

  if (loading || !current || current._id !== id) {
    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#8055FF"
        />

        <Text style={styles.loadingText}>
          Loading event...
        </Text>

      </View>
    );
  }


  // TICKET DATA

  const tickets = current.ticketTypes || [];


  // QUANTITY UPDATE

  const updateQuantity = (ticketId, change, available) => {

    setQuantities((prev) => {

      const next = Math.max(
        0,
        Math.min(
          available,
          (prev[ticketId] || 0) + change
        )
      );

      return {
        ...prev,
        [ticketId]: next,
      };

    });

  };


  // TOTAL QUANTITY

  const totalQuantity = tickets.reduce(
    (sum, ticket) =>
      sum + (quantities[ticket._id] || 0),
    0
  );


  // TOTAL PRICE

  const totalPrice = tickets.reduce(
    (sum, ticket) =>
      sum +
      (quantities[ticket._id] || 0) *
      Number(ticket.price || 0),
    0
  );


  // SELECTED TICKETS

  const selectedTickets = tickets
    .filter((ticket) => (quantities[ticket._id] || 0) > 0)
    .map((ticket) => ({
      ticketTypeId: ticket._id,
      quantity: quantities[ticket._id],
    }));


  // EVENT INFORMATION

  const eventDate = current.startDate
    ? new Date(current.startDate).toDateString()
    : 'Date TBA';

  const location = [
    current.venue?.name,
    current.venue?.address,
    current.venue?.city,
  ]
    .filter(Boolean)
    .join(', ');


  return (

    <View style={styles.container}>

      <StatusBar
        backgroundColor="#080F1E"
        barStyle="light-content"
      />


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >


        {/* ================================= */}
        {/* EVENT BANNER */}
        {/* ================================= */}

        {/* EVENT BANNER */}

<View style={styles.bannerContainer}>

  <Image
    source={{
      uri:
        current.bannerImage ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000',
    }}
    style={styles.banner}
    resizeMode="cover"
  />

  <IconButton
    icon="arrow-left"
    iconColor="#FFFFFF"
    size={24}
    containerColor="rgba(8,15,30,0.85)"
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  />

</View>


        {/* ================================= */}
        {/* EVENT BODY */}
        {/* ================================= */}

        <View style={styles.body}>


          <Text style={styles.category}>
            {current.category || 'EVENT'}
          </Text>

          <Text style={styles.title}>
            {current.title}
          </Text>



          {/* EVENT INFORMATION */}

          <View style={styles.infoContainer}>

            <InfoRow
              icon="calendar"
              label="DATE"
              value={eventDate}
            />

            <InfoRow
              icon="clock-outline"
              label="TIME"
              value={`${current.startTime || 'TBA'} - ${current.endTime || 'TBA'}`}
            />

            <InfoRow
              icon="map-marker-outline"
              label="LOCATION"
              value={location || 'Location TBA'}
            />

            <InfoRow
              icon="account-outline"
              label="ORGANIZER"
              value={current.organizer?.name || 'Event Organizer'}
            />

          </View>



          {/* ABOUT EVENT */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              About Event
            </Text>

            <Text style={styles.description}>
              {current.description ||
                'Join us for an amazing event experience.'}
            </Text>

          </View>



          {/* EVENT SCHEDULE */}

          {!!current.schedule?.length && (

            <View style={styles.section}>

              <Text style={styles.sectionTitle}>
                Event Schedule
              </Text>

              {current.schedule.map((item, index) => (

                <View
                  key={index}
                  style={styles.scheduleRow}
                >

                  <View style={styles.scheduleDot} />

                  <View style={{ flex: 1 }}>

                    <Text style={styles.scheduleTime}>
                      {item.time}
                    </Text>

                    <Text style={styles.scheduleTitle}>
                      {item.title}
                    </Text>

                  </View>

                </View>

              ))}

            </View>

          )}



          {/* ================================= */}
          {/* TICKET SECTION */}
          {/* ================================= */}

          <View style={styles.ticketHeading}>

            <View>

              <Text style={styles.sectionTitle}>
                Choose Your Tickets
              </Text>

              <Text style={styles.ticketSubtitle}>
                Select tickets for your experience
              </Text>

            </View>

            <View style={styles.ticketEmoji}>
              <Text style={{ fontSize: 22 }}>
                🎟️
              </Text>
            </View>

          </View>



          {/* TICKET CARDS */}

          {tickets.length > 0 ? (

            tickets.map((ticket, index) => {

              const available = Math.max(
                0,
                Number(ticket.totalCapacity || 0) -
                Number(ticket.soldCount || 0)
              );

              const quantity = quantities[ticket._id] || 0;

              const soldOut = available <= 0;


              return (

                <View
                  key={ticket._id || index}
                  style={[
                    styles.ticketCard,
                    quantity > 0 && styles.ticketActive,
                  ]}
                >


                  {/* TICKET TOP */}

                  <View style={styles.ticketTop}>

                    <View style={{ flex: 1 }}>

                      <Text style={styles.ticketName}>
                        {ticket.name}
                      </Text>

                      {!!ticket.description && (

                        <Text style={styles.ticketDescription}>
                          {ticket.description}
                        </Text>

                      )}


                      {/* AVAILABLE SEATS */}

                      <View style={styles.seatsRow}>

                        <View
                          style={[
                            styles.statusDot,
                            soldOut && styles.soldOutDot,
                          ]}
                        />

                        <Text style={styles.seatsText}>
                          {soldOut
                            ? 'Sold Out'
                            : `${available} seats left`}
                        </Text>

                      </View>

                    </View>


                    {/* PRICE */}

                    <View style={styles.priceBox}>

                      <Text style={styles.ticketPrice}>
                        {Number(ticket.price) === 0
                          ? 'FREE'
                          : `₹${ticket.price}`}
                      </Text>

                      <Text style={styles.perTicket}>
                        Per ticket
                      </Text>

                    </View>

                  </View>



                  {/* DIVIDER */}

                  <View style={styles.ticketDivider} />



                  {/* QUANTITY SELECTOR */}

                  <View style={styles.quantityRow}>

                    <Text style={styles.quantityLabel}>
                      Select quantity
                    </Text>


                    <View style={styles.quantityContainer}>


                      {/* MINUS */}

                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          quantity === 0 && styles.disabledButton,
                        ]}
                        disabled={quantity === 0}
                        onPress={() =>
                          updateQuantity(
                            ticket._id,
                            -1,
                            available
                          )
                        }
                      >

                        <Text style={styles.quantitySymbol}>
                          −
                        </Text>

                      </TouchableOpacity>


                      {/* QUANTITY */}

                      <Text style={styles.quantityValue}>
                        {quantity}
                      </Text>


                      {/* PLUS */}

                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          (soldOut || quantity >= available) &&
                            styles.disabledButton,
                        ]}
                        disabled={
                          soldOut || quantity >= available
                        }
                        onPress={() =>
                          updateQuantity(
                            ticket._id,
                            1,
                            available
                          )
                        }
                      >

                        <Text style={styles.quantitySymbol}>
                          +
                        </Text>

                      </TouchableOpacity>

                    </View>

                  </View>



                  {/* SUBTOTAL */}

                  {quantity > 0 && (

                    <View style={styles.subtotalRow}>

                      <Text style={styles.subtotalLabel}>
                        Subtotal
                      </Text>

                      <Text style={styles.subtotalPrice}>
                        ₹{(
                          quantity *
                          Number(ticket.price || 0)
                        ).toLocaleString('en-IN')}
                      </Text>

                    </View>

                  )}

                </View>

              );

            })

          ) : (

            <View style={styles.emptyTickets}>

              <Text style={styles.emptyText}>
                No tickets available right now.
              </Text>

            </View>

          )}

        </View>

      </ScrollView>



      {/* ================================= */}
      {/* STICKY BOTTOM BOOKING BAR */}
      {/* ================================= */}

      <View style={styles.bottomBar}>


        {/* TOTAL PRICE */}

        <View style={styles.bottomPrice}>

          <Text style={styles.bottomLabel}>
            TOTAL AMOUNT
          </Text>

          <Text style={styles.totalPrice}>
            ₹{totalPrice.toLocaleString('en-IN')}
          </Text>

          <Text style={styles.totalTickets}>
            {totalQuantity} ticket(s) selected
          </Text>

        </View>



        {/* SELECT TICKETS BUTTON */}

        <Button
          mode="contained"
          icon="arrow-right"
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={styles.selectButton}
          disabled={totalQuantity === 0}
          onPress={() => {

            navigation.navigate('TicketSelect', {
              eventId: current._id,
              selectedTickets,
            });

          }}
        >
          Select Tickets
        </Button>

      </View>

    </View>

  );

}



// ==========================================
// EVENT INFORMATION ROW COMPONENT
// ==========================================

function InfoRow({ icon, label, value }) {

  return (

    <View style={styles.infoRow}>

      <View style={styles.infoIcon}>

        <IconButton
          icon={icon}
          iconColor="#A78BFA"
          size={21}
          style={{ margin: 0 }}
        />

      </View>

      <View style={{ flex: 1 }}>

        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>

      </View>

    </View>

  );

}


// ==========================================
// PART 2 CONTINUES BELOW
// ==========================================

const styles = StyleSheet.create({

  // MAIN CONTAINER

  container: {
    flex: 1,
    backgroundColor: '#080F1E',
  },

  center: {
    flex: 1,
    backgroundColor: '#080F1E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#AAB7D0',
    marginTop: 12,
  },

  scrollContent: {
    paddingBottom: 20,
  },


  // EVENT BANNER

  bannerContainer: {
    height: 285,
    position: 'relative',
    backgroundColor: '#111C35',
  },

  banner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,10,25,0.58)',
  },

  backButton: {
    position: 'absolute',
    top: 38,
    left: 12,
    margin: 0,
  },

  bannerContent: {
    position: 'absolute',
    bottom: 22,
    left: 20,
    right: 20,
  },

  categoryBadge: {
    backgroundColor: '#8055FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 8,
  },

  bannerLocation: {
    color: '#E0E5F5',
    fontSize: 13,
  },


  // BODY

  body: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  category: {
    color: '#9978FF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 7,
    marginBottom: 18,
  },


  // EVENT INFORMATION

  infoContainer: {
    backgroundColor: '#111C30',
    borderRadius: 18,
    padding: 14,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1E2A43',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#222B48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  infoLabel: {
    color: '#8997B2',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },


  // ABOUT EVENT

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 11,
  },

  description: {
    color: '#B7C2D8',
    fontSize: 14,
    lineHeight: 23,
  },


  // EVENT SCHEDULE

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    marginTop: 5,
    marginRight: 13,
  },

  scheduleTime: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
  },

  scheduleTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },


  // TICKET HEADER

  ticketHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  ticketSubtitle: {
    color: '#8997B2',
    fontSize: 12,
    marginTop: -5,
  },

  ticketEmoji: {
    width: 43,
    height: 43,
    backgroundColor: '#211B43',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },


  // TICKET CARDS

  ticketCard: {
    backgroundColor: '#141F34',
    borderRadius: 17,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#27334C',
  },

  ticketActive: {
    borderColor: '#895FFF',
    backgroundColor: '#1B2140',
  },

  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  ticketName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  ticketDescription: {
    color: '#9AA8C2',
    fontSize: 11,
    marginTop: 5,
  },

  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#35D69A',
    marginRight: 7,
  },

  soldOutDot: {
    backgroundColor: '#FF5F68',
  },

  seatsText: {
    color: '#AAB7D0',
    fontSize: 11,
  },

  priceBox: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  ticketPrice: {
    color: '#A78BFA',
    fontSize: 21,
    fontWeight: '900',
  },

  perTicket: {
    color: '#8492AC',
    fontSize: 10,
    marginTop: 3,
  },

  ticketDivider: {
    height: 1,
    backgroundColor: '#29354C',
    marginTop: 16,
    marginBottom: 13,
  },


  // QUANTITY SELECTOR

  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quantityLabel: {
    color: '#B6C2D9',
    fontSize: 12,
    fontWeight: '600',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1629',
    borderRadius: 10,
    padding: 4,
  },

  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#8055FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  quantitySymbol: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  quantityValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    minWidth: 38,
    textAlign: 'center',
  },


  // SUBTOTAL

  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  subtotalLabel: {
    color: '#9CAAC2',
    fontSize: 12,
  },

  subtotalPrice: {
    color: '#A78BFA',
    fontWeight: '800',
    fontSize: 14,
  },

  emptyTickets: {
    padding: 20,
    backgroundColor: '#141F34',
    borderRadius: 14,
  },

  emptyText: {
    color: '#AAB7D0',
    textAlign: 'center',
  },


  // BOTTOM BOOKING BAR

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111B2D',
    borderTopWidth: 1,
    borderTopColor: '#27334C',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },

  bottomPrice: {
    flex: 1,
  },

  bottomLabel: {
    color: '#8D9BB5',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  totalPrice: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 3,
  },

  totalTickets: {
    color: '#AAB7D0',
    fontSize: 10,
    marginTop: 2,
  },

  selectButton: {
    backgroundColor: '#8055FF',
    borderRadius: 13,
    minWidth: 165,
  },

  buttonContent: {
    height: 49,
    flexDirection: 'row-reverse',
  },

  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

});
