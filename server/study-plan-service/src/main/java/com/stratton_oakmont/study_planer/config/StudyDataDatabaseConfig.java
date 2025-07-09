package com.stratton_oakmont.study_planer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.stratton_oakmont.study_planer.repository.studydata",
    entityManagerFactoryRef = "studyDataEntityManagerFactory",
    transactionManagerRef = "studyDataTransactionManager"
)
public class StudyDataDatabaseConfig { 
    
    @Bean(name = "studyDataDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.studydata")
    public DataSource studyDataDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "studyDataEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean studyDataEntityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(studyDataDataSource());
        em.setPackagesToScan("com.stratton_oakmont.study_planer.entity.studydata");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        return em;
    }

    @Bean(name = "studyDataTransactionManager")
    public PlatformTransactionManager studyDataTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(studyDataEntityManagerFactory().getObject());
        return transactionManager;
    }
}