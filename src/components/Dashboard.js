import React, { Component } from 'react';
import ReactNotification, { store } from 'react-notifications-component';
import { bufferToHex } from 'ethereumjs-util';
import { encrypt } from 'eth-sig-util';

import auth from '../utils/auth';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import Navbar from './Navbar';
import Field from './Field';
import { ReactComponent as Plus } from '../assets/icons/plus.svg';
export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addField = this.addField.bind(this);
    this.removeField = this.removeField.bind(this);

    this.state = {
      user: '',
      contract: null,
      formData: [],
      templateData: [],
      ownerAddress: '',
      documentName: '',
    };
  }

  componentDidMount = () => {
    if (!auth.getContract()) {
      auth.init().then(() => {
        this.initialize();
      });
    } else {
      this.initialize();
    }
  };

  initialize = () => {
    window.ethereum.on('accountsChanged', async function (accounts) {
      auth.logout(() => {
        this.props.history.push('/');
      });
    });

    this.setState(
      { user: auth.getUser(), contract: auth.getContract() },
      () => {
        this.state.contract.events.DocumentIssued(
          { filter: { issuer: this.state.user }, fromBlock: 'latest' },
          (err, result) => {
            if (err) {
              return console.error(err);
            }
            this.notify('Success', 'Document issued successfully', 'success');
          }
        );
      }
    );
  };

  handleInputChange(event, index) {
    const formData = [...this.state.formData];
    formData[index].fieldValue = event.target.value;
    this.setState({ formData });
  }

  handleChange(event) {
    const input = event.target;
    const value = input.value;
    this.setState({ [input.name]: value });
  }

  addField() {
    const formData = [...this.state.formData];
    const templateData = [...this.state.templateData];

    const label = prompt('Enter field name');
    if (label) {
      const field = {
        fieldLabel: label,
        fieldValue: '',
      };

      formData.push(field);
      templateData.push({ label });
      this.setState({ formData, templateData });
    }
  }

  removeField(index) {
    const formData = [...this.state.formData];
    const templateData = [...this.state.templateData];
    formData.splice(index, 1);
    templateData.splice(index, 1);
    this.setState({ formData, templateData });
  }

  issueDocument = async () => {
    if (this.state.ownerAddress === '' || this.state.documentName === '') {
      this.notify(
        'Invalid data',
        'Please fill the neccessary fields to continue',
        'danger'
      );
    } else if (this.state.formData.length === 0) {
      this.notify(
        'Invalid document',
        'Document is empty, please add more fields',
        'danger'
      );
    } else {
      try {
        await this.state.contract.methods
          .getEncryptionPublicKey(this.state.ownerAddress)
          .call()
          .then((encryptionPublicKey) => {
            const encryptedData = bufferToHex(
              Buffer.from(
                JSON.stringify(
                  encrypt(
                    encryptionPublicKey,
                    { data: JSON.stringify(this.state.formData) },
                    'x25519-xsalsa20-poly1305'
                  )
                ),
                'utf8'
              )
            );

            this.state.contract.methods
              .issueDocument(
                this.state.documentName,
                Math.floor(Date.now() / 1000),
                encryptedData,
                JSON.stringify(this.state.templateData),
                this.state.ownerAddress
              )
              .send({ from: this.state.user }, (err, txnHash) => {
                if (err) {
                  this.notify(
                    'Transaction failed',
                    'Sign the transaction to issue document',
                    'danger'
                  );
                } else {
                  this.clearInputs();
                }
              });
          });
      } catch (error) {
        this.notify(
          'Invalid owner address',
          'Please check and correct owner address',
          'danger'
        );
      }
    }
  };

  clearInputs = () => {
    const formData = [];
    const templateData = [];
    const ownerAddress = '';
    const documentName = '';
    this.setState({ formData, templateData, ownerAddress, documentName });
  };

  notify = (title, message, type) => {
    store.addNotification({
      title: title,
      message: message,
      type: type, // 'default', 'success', 'info', 'warning'
      container: 'top-right', // where to position the notifications
      animationIn: ['animate__animated', 'animate__fadeInDown'], // animate.css classes that's applied
      animationOut: ['animate__animated', 'animate__fadeOutDown'], // animate.css classes that's applied
      dismiss: {
        duration: 3000,
        showIcon: true,
        pauseOnHover: true,
      },
    });
  };

  render() {
    return (
      <div>
        <Navbar user={this.state.user} history={this.props.history} />
        <ReactNotification className='font-Poppins' />
        <div className='mt-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 font-Poppins'>
          <div className='mt-10 sm:mt-0'>
            <div className='mt-5 md:mt-0 md:col-span-2'>
              <div className='shadow overflow-hidden sm:rounded-md'>
                <div className='px-4 py-5 bg-white sm:p-6'>
                  <div className='grid grid-cols-9 gap-6'>
                    <div className='col-span-9 sm:col-span-3'>
                      <label className='block text-sm font-medium text-gray-700'>
                        Issuer address
                      </label>
                      <input
                        type='text'
                        name='issuerAddress'
                        autoComplete='off'
                        disabled
                        value={this.state.user}
                        className='mt-1 select-none cursor-not-allowed disabled:opacity-50 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
                      />
                    </div>
                    <div className='col-span-9 sm:col-span-3'>
                      <label className='block text-sm font-medium text-gray-700'>
                        Owner address<span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='ownerAddress'
                        autoComplete='off'
                        onChange={this.handleChange}
                        value={this.state.ownerAddress}
                        className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
                      />
                    </div>
                    <div className='col-span-9 sm:col-span-3'>
                      <label className='block text-sm font-medium text-gray-700'>
                        Document name<span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='documentName'
                        autoComplete='off'
                        onChange={this.handleChange}
                        value={this.state.documentName}
                        className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
                      />
                    </div>

                    {this.state.formData.map((field, i) => (
                      <Field
                        key={i}
                        index={i}
                        field={field}
                        handleInputChange={this.handleInputChange}
                        value={this.state.formData[i].fieldValue}
                        removeField={this.removeField}
                      />
                    ))}

                    <div className='mt-6 col-span-7 sm:col-span-4'>
                      <button
                        name='addField'
                        onClick={this.addField}
                        className='flex items-center p-2 pr-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      >
                        <Plus className='h-5 w-5' />
                        Add another field
                      </button>
                    </div>
                  </div>
                </div>

                <div className='px-4 py-3 bg-gray-100 text-right sm:px-6'>
                  <button
                    onClick={this.issueDocument}
                    className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    Issue document
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
